import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, BrainCircuit, ChevronRight, Clock3, Crown, Eye, FileText, LayoutDashboard, LogOut, Menu, PenSquare, Search, ShieldCheck, Sparkles, Star, Trophy, UserCircle2, Users } from 'lucide-react';
import api from './services/api';
import { useAuth } from './context/AuthContext';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Articles', to: '/articles' },
  { label: 'Openings', to: '/articles?category=openings' },
  { label: 'Tactics', to: '/articles?category=tactics' },
  { label: 'Endgame', to: '/articles?category=endgame' },
  { label: 'Authors', to: '/articles' },
  { label: 'About', to: '/about' }
];

const categoryPalette = ['#111827', '#374151', '#C9A227', '#F5F1E8'];

const formatDate = (date: string | Date | undefined) => {
  if (!date) return 'Recently';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    draft: 'bg-amber-100 text-amber-800',
    pending_review: 'bg-indigo-100 text-indigo-800',
    changes_requested: 'bg-orange-100 text-orange-800',
    published: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800',
    archived: 'bg-slate-200 text-slate-700'
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] || 'bg-slate-100 text-slate-700'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:slug" element={<ArticleDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/articles/new" element={<NewArticlePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/articles?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-[#111827]/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A227] text-lg font-bold text-slate-900">C</div>
          <div>
            <div className="text-lg font-semibold tracking-wide">Chess Chronicle</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-200 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.to} className={({ isActive }) => (isActive ? 'text-white' : 'text-slate-300')}>{item.label}</NavLink>
          ))}
        </nav>

        <div className="hidden flex-1 justify-center px-6 lg:flex">
          <form onSubmit={handleSearch} className="w-full max-w-md">
            <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-2">
              <Search size={16} className="text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chess topics..." className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none" />
            </div>
          </form>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-secondary border-slate-600 bg-slate-800 text-white hover:bg-slate-700">Dashboard</Link>
              <button onClick={logout} className="btn-primary bg-[#C9A227] text-slate-900 hover:bg-[#d5b554]">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary border-slate-600 bg-slate-800 text-white hover:bg-slate-700">Login</Link>
              <Link to="/register" className="btn-primary bg-[#C9A227] text-slate-900 hover:bg-[#d5b554]">Write an Article</Link>
            </>
          )}
        </div>

        <button className="rounded-md p-2 text-white lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-700 bg-slate-900 px-4 py-4 lg:hidden">
          <div className="mb-3">
            <form onSubmit={handleSearch} className="rounded-full border border-slate-700 bg-slate-800 px-3 py-2">
              <div className="flex items-center gap-2">
                <Search size={16} className="text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chess topics..." className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none" />
              </div>
            </form>
          </div>
          <div className="flex flex-col gap-3 text-sm text-slate-200">
            {navItems.map((item) => (
              <NavLink key={item.label} to={item.to} onClick={() => setOpen(false)}>{item.label}</NavLink>
            ))}
            {!user ? (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" onClick={() => setOpen(false)}>Write an Article</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                <button onClick={logout}>Logout</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#111827] text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A227] font-bold text-slate-900">C</div>
            <span className="text-lg font-semibold text-white">Chess Chronicle</span>
          </div>
          <p className="text-sm text-slate-400">Premium chess journalism, analysis, and community stories.</p>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">Explore</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/articles">Articles</Link></li>
            <li><Link to="/articles?category=openings">Openings</Link></li>
            <li><Link to="/articles?category=middlegame">Middlegame</Link></li>
            <li><Link to="/articles?category=endgame">Endgame</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">Company</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>About</li>
            <li>Contact</li>
            <li>Privacy Policy</li>
            <li>Editorial Guidelines</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">Newsletter</h3>
          <div className="flex gap-2">
            <input className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400" placeholder="Email address" />
            <button className="btn-primary bg-[#C9A227] text-slate-900 hover:bg-[#d5b554]">Join</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function HomePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [articleRes, categoryRes] = await Promise.all([
        api.get('/articles?sort=newest'),
        api.get('/categories')
      ]);
      setArticles(articleRes.data.articles || []);
      setCategories(categoryRes.data.categories || []);
    };
    load();
  }, []);

  const featured = articles.slice(0, 3);
  const latest = articles.slice(0, 6);

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-8 overflow-hidden rounded-[28px] bg-[#111827] px-6 py-10 text-white shadow-soft lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#E9D6A0]">
            <Sparkles size={13} /> Premium chess publication
          </div>
          <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl">Where Chess Ideas Come to Life</h1>
          <p className="mt-5 max-w-lg text-base text-slate-300">Discover chess articles, strategies, tournament stories, annotated games, opening ideas, and insights from the chess community.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/articles" className="btn-primary bg-[#C9A227] text-slate-900 hover:bg-[#d5b554]">Explore Articles</Link>
            <Link to="/register" className="btn-secondary border-slate-600 bg-white/5 text-white hover:bg-white/10">Write an Article</Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="relative flex items-center justify-center">
          <div className="relative w-full max-w-md rounded-[28px] border border-slate-700 bg-gradient-to-br from-[#1f2937] to-slate-900 p-6 shadow-2xl">
            <div className="grid grid-cols-8 gap-2 rounded-2xl bg-[#f5f1e8] p-4">
              {Array.from({ length: 64 }).map((_, idx) => {
                const dark = (Math.floor(idx / 8) + idx) % 2 === 0;
                return <div key={idx} className={`${dark ? 'bg-[#d7d2c7]' : 'bg-[#6b7280]'} h-8 rounded-sm`} />;
              })}
            </div>
            <div className="absolute -left-5 top-12 rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-white">Opening theory</div>
            <div className="absolute -right-8 bottom-8 rounded-xl border border-slate-600 bg-[#C9A227] px-3 py-2 text-xs font-semibold text-slate-900">Strategy</div>
          </div>
        </motion.div>
      </section>

      <section>
        <SectionHeader title="Latest Articles" action="Read the journal" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {latest.map((article: any) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Featured Articles" action="Editorial picks" />
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          {featured[0] && (
            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-soft">
              <img src={featured[0].featuredImage || 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d'} alt={featured[0].title} className="h-72 w-full object-cover" />
              <div className="p-6">
                <div className="mb-3 inline-flex rounded-full bg-[#F5F1E8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">{featured[0].category?.name || 'Featured'}</div>
                <h3 className="text-3xl font-semibold text-slate-900">{featured[0].title}</h3>
                <p className="mt-3 text-slate-600">{featured[0].excerpt}</p>
                <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                  <div className="flex items-center gap-3">
                    <img className="h-9 w-9 rounded-full" src={featured[0].author?.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'} alt={featured[0].author?.name || 'Author'} />
                    <span>{featured[0].author?.name || 'Author'}</span>
                  </div>
                  <span>{formatDate(featured[0].publishedAt || featured[0].createdAt)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {featured.slice(1).map((article: any) => (
              <div key={article._id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-soft">
                <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                  <span>{article.category?.name || 'Feature'}</span>
                  <span>{article.views || 0} views</span>
                </div>
                <h4 className="text-xl font-semibold text-slate-900">{article.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{article.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="Explore Chess Topics" action="Browse categories" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category: any, index: number) => (
            <Link key={category._id} to={`/articles?category=${encodeURIComponent(category.slug)}`} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-1">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ background: categoryPalette[index % categoryPalette.length], color: index % 2 === 0 ? '#fff' : '#111827' }}>{category.icon || '♟️'}</div>
              <h3 className="text-xl font-semibold text-slate-900">{category.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{category.description}</p>
              <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                <span>{category.articleCount || 0} articles</span>
                <ChevronRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
      <span className="text-sm text-slate-500">{action}</span>
    </div>
  );
}

function ArticleCard({ article }: { article: any }) {
  return (
    <Link to={`/articles/${article.slug}`} className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1">
      <img src={article.featuredImage || 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d'} alt={article.title} className="h-52 w-full object-cover" />
      <div className="p-5">
        <div className="mb-3 inline-flex rounded-full bg-[#F5F1E8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">{article.category?.name || 'Category'}</div>
        <h3 className="text-2xl font-semibold text-slate-900">{article.title}</h3>
        <p className="mt-3 text-slate-600">{article.excerpt}</p>
        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
          <img className="h-8 w-8 rounded-full" src={article.author?.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'} alt={article.author?.name || 'Author'} />
          <div className="flex-1">
            <div>{article.author?.name || 'Author'}</div>
            <div>{formatDate(article.publishedAt || article.createdAt)} · {article.readingTime || 5} min read</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState(new URLSearchParams(window.location.search).get('search') || '');
  const [category, setCategory] = useState(new URLSearchParams(window.location.search).get('category') || '');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get('search') || '');
    setCategory(params.get('category') || '');
  }, [window.location.search]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get('/articles', { params: { search, category, sort } });
      setArticles(res.data.articles || []);
      const categoryRes = await api.get('/categories');
      setCategories(categoryRes.data.categories || []);
    };
    fetchData();
  }, [search, category, sort]);

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-slate-900">Articles</h1>
            <p className="mt-2 text-slate-600">Explore analysis, ideas, and tournament stories from the chess community.</p>
          </div>
          <div className="flex w-full max-w-xl gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="input" placeholder="Search article title or topic" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input max-w-[180px]">
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={() => setCategory('')} className={`rounded-full px-3 py-2 text-sm ${!category ? 'bg-[#111827] text-white' : 'bg-slate-100 text-slate-700'}`}>All</button>
          {categories.map((categoryItem: any) => (
            <button key={categoryItem._id} onClick={() => setCategory(categoryItem.slug)} className={`rounded-full px-3 py-2 text-sm ${category === categoryItem.slug ? 'bg-[#C9A227] text-slate-900' : 'bg-slate-100 text-slate-700'}`}>
              {categoryItem.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article: any) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
    </div>
  );
}

function ArticleDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/articles/${slug}`);
      setArticle(res.data.article);
    };
    if (slug) load();
  }, [slug]);

  if (!article) {
    return <div className="text-center text-slate-600">Loading article...</div>;
  }

  return (
    <article className="mx-auto max-w-4xl rounded-[26px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <div className="mb-3 inline-flex rounded-full bg-[#F5F1E8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">{article.category?.name || 'Article'}</div>
      <h1 className="text-4xl font-semibold leading-tight text-slate-900">{article.title}</h1>
      <p className="mt-3 text-xl text-slate-600">{article.subtitle}</p>

      <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-3">
          <img className="h-10 w-10 rounded-full" src={article.author?.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'} alt={article.author?.name} />
          <span>{article.author?.name}</span>
        </div>
        <span>·</span>
        <span>{formatDate(article.publishedAt || article.createdAt)}</span>
        <span>·</span>
        <span>{article.readingTime || 5} min read</span>
        <span>·</span>
        <span>{article.views || 0} views</span>
      </div>

      <img src={article.featuredImage || 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d'} alt={article.title} className="mt-8 h-[420px] w-full rounded-[26px] object-cover" />

      <div className="mt-8 prose max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: article.content || '<p>Content coming soon.</p>' }} />
    </article>
  );
}

function RegisterPage() {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', country: '', bio: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <h1 className="text-3xl font-semibold text-slate-900">Create your account</h1>
      <p className="mt-2 text-slate-600">Join the community and start publishing chess analysis.</p>
      {error && <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Full name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></div>
          <div><label className="label">Username</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input" /></div>
        </div>
        <div><label className="label">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></div>
        <div><label className="label">Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" /></div>
        <div><label className="label">Country</label><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input" /></div>
        <div><label className="label">Short bio</label><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input min-h-[100px]" /></div>
        <button type="submit" className="btn-primary w-full bg-[#C9A227] text-slate-900 hover:bg-[#d5b554]">Register</button>
      </form>
    </div>
  );
}

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
      <p className="mt-2 text-slate-600">Continue writing and managing your chess work.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div><label className="label">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" /></div>
        <div><label className="label">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" /></div>
        <button type="submit" className="btn-primary w-full bg-[#C9A227] text-slate-900 hover:bg-[#d5b554]">Login</button>
      </form>
    </div>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const res = await api.get('/articles/me');
      setArticles(res.data.articles || []);
    };
    load();
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const stats = useMemo(() => ({
    total: articles.length,
    published: articles.filter((a) => a.status === 'published').length,
    pending: articles.filter((a) => a.status === 'pending_review').length,
    drafts: articles.filter((a) => a.status === 'draft').length,
    rejected: articles.filter((a) => a.status === 'rejected').length
  }), [articles]);

  return (
    <div className="space-y-8">
      <div className="rounded-[26px] bg-[#111827] p-6 text-white shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[#E9D6A0]">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold">Welcome, {user.name}</h1>
          </div>
          <Link to="/dashboard/articles/new" className="btn-primary bg-[#C9A227] text-slate-900 hover:bg-[#d5b554]">Create Article</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Articles" value={stats.total} />
        <StatCard label="Published" value={stats.published} />
        <StatCard label="Pending Review" value={stats.pending} />
        <StatCard label="Drafts" value={stats.drafts} />
        <StatCard label="Rejected" value={stats.rejected} />
      </div>

      <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">My Articles</h2>
          <button onClick={() => navigate('/dashboard/articles/new')} className="btn-secondary">New Draft</button>
        </div>
        <div className="space-y-4">
          {articles.length === 0 ? <div className="text-slate-500">No articles yet.</div> : articles.map((article) => (
            <div key={article._id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-slate-900">{article.title}</div>
                <div className="mt-1 text-sm text-slate-500">{article.category?.name || 'General'} · {formatDate(article.updatedAt)}</div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={article.status} />
                <button onClick={() => navigate(`/dashboard/articles/new?articleId=${article._id}`)} className="btn-secondary">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function NewArticlePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    featuredImage: '',
    seoTitle: '',
    seoDescription: '',
    fen: '',
    pgn: ''
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/categories');
      setCategories(res.data.categories || []);
    };
    load();
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  const saveDraft = async () => {
    const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
    const res = await api.post('/articles', payload);
    setMessage('Draft saved successfully.');
    navigate('/dashboard');
    return res;
  };

  const submitForReview = async () => {
    const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
    const articleRes = await api.post('/articles', payload);
    const id = articleRes.data.article._id;
    await api.post(`/articles/${id}/submit`);
    setMessage('Your article has been submitted successfully. It will be reviewed by our editorial team before publication.');
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[26px] bg-[#111827] p-6 text-white shadow-soft">
        <h1 className="text-3xl font-semibold">Create Article</h1>
      </div>
      {message && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
      <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-5 md:grid-cols-2">
          <div><label className="label">Article Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" /></div>
          <div><label className="label">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
            <option value="">Select</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select></div>
          <div className="md:col-span-2"><label className="label">Subtitle</label><input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input" /></div>
          <div className="md:col-span-2"><label className="label">Excerpt</label><textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="input min-h-[90px]" /></div>
          <div><label className="label">Tags</label><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input" /></div>
          <div><label className="label">Featured Image URL</label><input value={form.featuredImage} onChange={(e) => setForm({ ...form, featuredImage: e.target.value })} className="input" /></div>
          <div className="md:col-span-2"><label className="label">Article Content</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input min-h-[220px]" /></div>
          <div><label className="label">SEO Title</label><input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} className="input" /></div>
          <div><label className="label">SEO Description</label><input value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} className="input" /></div>
          <div><label className="label">Optional FEN</label><input value={form.fen} onChange={(e) => setForm({ ...form, fen: e.target.value })} className="input" /></div>
          <div><label className="label">Optional PGN</label><textarea value={form.pgn} onChange={(e) => setForm({ ...form, pgn: e.target.value })} className="input min-h-[120px]" /></div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={saveDraft} className="btn-secondary">Save Draft</button>
          <button onClick={submitForReview} className="btn-primary bg-[#C9A227] text-slate-900 hover:bg-[#d5b554]">Submit for Review</button>
        </div>
      </div>
    </div>
  );
}

function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, articlesRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/articles/pending')
        ]);
        setStats(statsRes.data);
        setArticles(articlesRes.data.articles || []);
      } catch (error) {
        console.error('Access denied');
      }
    };
    if (user?.role === 'admin') {
      load();
    }
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <div className="rounded-[22px] border border-rose-200 bg-rose-50 p-6 text-rose-700">Admin access required.</div>;

  const approveArticle = async (id: string) => {
    await api.post(`/admin/articles/${id}/approve`);
    setArticles((current) => current.filter((article) => article._id !== id));
  };

  const rejectArticle = async (id: string) => {
    await api.post(`/admin/articles/${id}/reject`, { rejectionReason: 'Please add more analysis and a stronger opening explanation.' });
    setArticles((current) => current.filter((article) => article._id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[26px] bg-[#111827] p-6 text-white shadow-soft">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Articles" value={stats.totalArticles || 0} />
        <StatCard label="Pending Reviews" value={stats.pendingReviews || 0} />
        <StatCard label="Published" value={stats.publishedArticles || 0} />
        <StatCard label="Rejected" value={stats.rejectedArticles || 0} />
        <StatCard label="Users" value={stats.registeredUsers || 0} />
        <StatCard label="This Month" value={stats.articlesThisMonth || 0} />
      </div>

      <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-2xl font-semibold text-slate-900">Pending Articles</h2>
        <div className="space-y-4">
          {articles.length === 0 ? <div className="text-slate-500">No pending review items.</div> : articles.map((article) => (
            <div key={article._id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-slate-900">{article.title}</div>
                <div className="mt-1 text-sm text-slate-500">By {article.author?.name} · {article.category?.name}</div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={article.status} />
                <button onClick={() => approveArticle(article._id)} className="btn-primary bg-[#C9A227] text-slate-900 hover:bg-[#d5b554]">Approve</button>
                <button onClick={() => rejectArticle(article._id)} className="btn-secondary">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
