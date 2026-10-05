const base = 'http://localhost:5001/api';

async function api(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status} ${JSON.stringify(json)}`);
  }

  return json;
}

(async () => {
  const unique = Date.now();

  const userPayload = {
    name: 'Workflow Tester',
    username: `workflow${unique}`,
    email: `workflow${unique}@example.com`,
    password: 'Secret123!',
    country: 'India',
    bio: 'Testing the editorial workflow.'
  };

  const user = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userPayload)
  });

  const userToken = user.token;
  const authorHeaders = { Authorization: `Bearer ${userToken}` };

  const created = await api('/articles', {
    method: 'POST',
    headers: authorHeaders,
    body: JSON.stringify({
      title: `Workflow Article ${unique}`,
      subtitle: 'A test article for approval flow',
      excerpt: 'This article demonstrates the review lifecycle.',
      content: '<h2>Test Content</h2><p>This is a test article for approval workflow verification.</p>',
      category: null,
      tags: ['workflow', 'testing'],
      featuredImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d',
      seoTitle: `Workflow Article ${unique}`,
      seoDescription: 'A test article demonstrating approval flow.'
    })
  });

  const draftId = created.article._id;
  console.log('DRAFT_CREATED', created.article.status);

  const submitResult = await api(`/articles/${draftId}/submit`, {
    method: 'POST',
    headers: authorHeaders
  });
  console.log('SUBMITTED', submitResult.message);

  const adminLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@chesschronicle.com',
      password: 'Admin@123'
    })
  });
  const adminHeaders = { Authorization: `Bearer ${adminLogin.token}` };

  const pending = await api('/admin/articles/pending', { headers: adminHeaders });
  const pendingArticle = pending.articles.find((article) => article._id === draftId);

  if (!pendingArticle) {
    throw new Error('Pending article not found after submission.');
  }

  console.log('PENDING_COUNT', pending.articles.length);

  const approved = await api(`/admin/articles/${draftId}/approve`, {
    method: 'POST',
    headers: adminHeaders
  });
  console.log('APPROVED', approved.message);

  const publishedArticle = await api(`/articles/${pendingArticle.slug}`, { method: 'GET' });
  console.log('PUBLIC_VISIBLE', publishedArticle.article.status);

  // request changes flow
  const changesUser = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Changes Tester',
      username: `change${Date.now()}`,
      email: `change${Date.now()}@example.com`,
      password: 'Secret123!',
      country: 'Brazil',
      bio: 'Will request changes.'
    })
  });

  const changesToken = changesUser.token;
  const changesHeaders = { Authorization: `Bearer ${changesToken}` };
  const changesArticle = await api('/articles', {
    method: 'POST',
    headers: changesHeaders,
    body: JSON.stringify({
      title: `Changes Request ${Date.now()}`,
      subtitle: 'Should request changes',
      excerpt: 'This article will be sent back for revision.',
      content: '<h2>Draft</h2><p>Needs revision.</p>',
      category: null,
      tags: ['changes'],
      featuredImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d',
      seoTitle: 'Change Request Example',
      seoDescription: 'Draft for change request.'
    })
  });

  await api(`/articles/${changesArticle.article._id}/submit`, {
    method: 'POST',
    headers: changesHeaders
  });

  const changesPending = await api('/admin/articles/pending', { headers: adminHeaders });
  const changeTarget = changesPending.articles.find((article) => article._id === changesArticle.article._id);

  const requested = await api(`/admin/articles/${changeTarget._id}/request-changes`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ adminFeedback: 'Please explain the opening ideas more clearly.' })
  });
  console.log('CHANGES_REQUESTED', requested.message);

  const updated = await api(`/articles/${changeTarget._id}`, {
    method: 'PUT',
    headers: changesHeaders,
    body: JSON.stringify({
      title: changeTarget.title,
      content: '<h2>Revised Content</h2><p>Improved explanation and deeper analysis.</p>',
      excerpt: 'This revised version meets the editorial standards.'
    })
  });
  console.log('EDITED', updated.article.status);

  await api(`/articles/${changeTarget._id}/submit`, {
    method: 'POST',
    headers: changesHeaders
  });

  const finalApprove = await api(`/admin/articles/${changeTarget._id}/approve`, {
    method: 'POST',
    headers: adminHeaders
  });
  console.log('REAPPROVED', finalApprove.message);

  // reject flow
  const rejectUser = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Reject Tester',
      username: `reject${Date.now()}`,
      email: `reject${Date.now()}@example.com`,
      password: 'Secret123!',
      country: 'Germany',
      bio: 'Will rejected article.'
    })
  });

  const rejectToken = rejectUser.token;
  const rejectHeaders = { Authorization: `Bearer ${rejectToken}` };
  const rejectArticle = await api('/articles', {
    method: 'POST',
    headers: rejectHeaders,
    body: JSON.stringify({
      title: `Rejected Article ${Date.now()}`,
      subtitle: 'This article should stay private',
      excerpt: 'The article will be rejected and remain private.',
      content: '<h2>Private</h2><p>Not for public view.</p>',
      category: null,
      tags: ['rejected'],
      featuredImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d',
      seoTitle: 'Rejected Example',
      seoDescription: 'This article should not be publicly visible.'
    })
  });

  await api(`/articles/${rejectArticle.article._id}/submit`, { method: 'POST', headers: rejectHeaders });
  const rejectedResult = await api(`/admin/articles/${rejectArticle.article._id}/reject`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ rejectionReason: 'Missing detailed analysis.' })
  });
  console.log('REJECTED', rejectedResult.message);

  const publicCheck = await fetch(`${base}/articles/${rejectArticle.article.slug}`);
  console.log('REJECT_PUBLIC_STATUS', publicCheck.status);
  console.log('WORKFLOW_CHECK_COMPLETED');
})();
