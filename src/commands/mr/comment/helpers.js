import { api } from '../../../client.js';

const COMMENT_TYPE_MAP = {
  global: 'GLOBAL_COMMENT',
  inline: 'INLINE_COMMENT',
};

export function buildListCommentsBody(opts) {
  const body = {};
  const type = opts.type || 'all';
  if (type !== 'all') {
    body.comment_type = COMMENT_TYPE_MAP[type];
  }
  if (opts.file) body.file_path = opts.file;
  if (opts.resolved === true) body.resolved = true;
  if (opts.resolved === false) body.resolved = false;
  if (!opts.includeDrafts) body.state = 'OPENED';
  if (opts.commentBizIds && opts.commentBizIds.length > 0) {
    body.comment_biz_id_list = opts.commentBizIds;
  }
  return body;
}

export function findCommentByBizId(comments, commentBizId) {
  if (!comments || !commentBizId) return null;
  const target = String(commentBizId);
  for (const comment of comments) {
    const found = findCommentInTree(comment, target);
    if (found) return found;
  }
  return null;
}

function findCommentInTree(comment, target) {
  if (!comment) return null;
  if (String(comment.comment_biz_id) === target) return comment;
  const children = comment.child_comments_list;
  if (!children || children.length === 0) return null;
  for (const child of children) {
    const found = findCommentInTree(child, target);
    if (found) return found;
  }
  return null;
}

export function pickDefaultPatchSetBizId(patches) {
  if (!patches || patches.length === 0) return undefined;
  const sourcePatches = patches.filter(
    (p) => p.relatedMergeItemType === 'MERGE_SOURCE',
  );
  const candidates = sourcePatches.length > 0 ? sourcePatches : patches;
  const sorted = [...candidates].sort(
    (a, b) => (b.versionNo ?? 0) - (a.versionNo ?? 0),
  );
  return sorted[0]?.patchSetBizId;
}

export function getCommentPatchSetBizId(comment) {
  if (!comment) return undefined;
  return (
    comment.patchset_biz_id ||
    comment.related_patchset?.patchSetBizId ||
    undefined
  );
}

export async function fetchParentComment(repoRef, localId, parentBizId, cfg) {
  const body = buildListCommentsBody({
    type: 'all',
    includeDrafts: true,
    commentBizIds: [parentBizId],
  });
  const { data } = await api.listChangeRequestComments(
    repoRef,
    localId,
    body,
    cfg,
  );
  const comments = Array.isArray(data) ? data : [];
  return findCommentByBizId(comments, parentBizId);
}

export async function resolvePatchSetBizId(repoRef, localId, comment, cfg) {
  let patchSetBizId = getCommentPatchSetBizId(comment);
  if (patchSetBizId) return patchSetBizId;
  const { data } = await api.listChangeRequestPatchSets(repoRef, localId, cfg);
  const patches = Array.isArray(data) ? data : [];
  patchSetBizId = pickDefaultPatchSetBizId(patches);
  if (!patchSetBizId) {
    throw new Error(
      'Could not determine patch set for the comment. The MR may have no diff versions.',
    );
  }
  return patchSetBizId;
}

export async function buildGlobalCommentBody(
  repoRef,
  localId,
  content,
  { draft = false } = {},
  cfg,
) {
  const patchsetBizId = await resolvePatchSetBizId(repoRef, localId, null, cfg);
  return {
    comment_type: 'GLOBAL_COMMENT',
    content,
    draft,
    patchset_biz_id: patchsetBizId,
    resolved: false,
  };
}

export function buildReplyCommentBody(parent, content, { draft = false } = {}) {
  const patchsetBizId = getCommentPatchSetBizId(parent);
  const body = {
    comment_type: parent.comment_type || 'GLOBAL_COMMENT',
    content,
    draft,
    parent_comment_biz_id: parent.comment_biz_id,
    patchset_biz_id: patchsetBizId,
    resolved: false,
  };
  if (parent.from_patchset_biz_id) {
    body.from_patchset_biz_id = parent.from_patchset_biz_id;
  }
  if (parent.to_patchset_biz_id) {
    body.to_patchset_biz_id = parent.to_patchset_biz_id;
  }
  const filePath = parent.filePath || parent.file_path;
  if (filePath) body.file_path = filePath;
  if (parent.line_number != null) body.line_number = parent.line_number;
  return body;
}
