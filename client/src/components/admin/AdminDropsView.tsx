import React, { useState, useEffect } from 'react';
import * as dropService from '../../services/dropService';
import * as productService from '../../services/productService';
import { DropType, Product } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  Flame,
  Plus,
  Edit,
  Trash2,
  X,
} from 'lucide-react';

export const AdminDropsView: React.FC = () => {
  const [drops, setDrops] = useState<DropType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingDrop, setEditingDrop] = useState<DropType | null>(null);

  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [banner, setBanner] = useState<string>('/images/hero-drop.jpg');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('Asia/Colombo');
  const [status, setStatus] = useState<string>('Upcoming');
  const [published, setPublished] = useState<boolean>(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [exclusiveStock, setExclusiveStock] = useState<number>(30);
  const [dropPrice, setDropPrice] = useState<string>('');

  const { addToast } = useToast();

  const loadAll = async () => {
    setLoading(true);
    try {
      const [dropsRes, prodsRes] = await Promise.all([
        dropService.getAllDropsAdmin(),
        productService.getProducts(),
      ]);
      setDrops(dropsRes);
      setProducts(prodsRes);
    } catch (err) {
      console.warn('Failed to load drops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreateModal = () => {
    setEditingDrop(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setBanner('/images/hero-drop.jpg');
    const defaultDate = new Date(Date.now() + 86400000 * 2);
    setScheduledAt(defaultDate.toISOString().slice(0, 16));
    setTimezone('Asia/Colombo');
    setStatus('Upcoming');
    setPublished(true);
    setSelectedProductIds([]);
    setExclusiveStock(30);
    setDropPrice('');
    setModalOpen(true);
  };

  const openEditModal = (drop: DropType) => {
    setEditingDrop(drop);
    setTitle(drop.title);
    setSlug(drop.slug);
    setDescription(drop.description);
    setBanner(drop.banner);
    setScheduledAt(new Date(drop.scheduledAt).toISOString().slice(0, 16));
    setTimezone(drop.timezone || 'Asia/Colombo');
    setStatus(drop.status);
    setPublished(drop.published);
    setSelectedProductIds(drop.products?.map((dp) => dp.productId) || []);
    setExclusiveStock(drop.products?.[0]?.exclusiveStock || 30);
    setDropPrice(drop.products?.[0]?.dropPrice ? String(drop.products[0].dropPrice) : '');
    setModalOpen(true);
  };

  const handleSaveDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const productPayload = selectedProductIds.map((pId) => ({
        productId: pId,
        stock: exclusiveStock,
        price: dropPrice ? Number(dropPrice) : null,
      }));

      const payload = {
        title,
        slug: slug || undefined,
        description,
        banner,
        scheduledAt,
        timezone,
        status: status as any,
        published,
        productIds: productPayload,
      };

      if (editingDrop) {
        await dropService.updateDrop(editingDrop.id, payload);
        addToast({ title: 'Drop Updated', message: `Updated "${title}"`, type: 'success' });
      } else {
        await dropService.createDrop(payload);
        addToast({ title: 'Drop Scheduled', message: `Created new drop "${title}"`, type: 'success' });
      }

      setModalOpen(false);
      loadAll();
    } catch (err: any) {
      addToast({
        title: 'Error Saving Drop',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  const handleDelete = async (id: string, dropTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${dropTitle}"?`)) return;
    try {
      await dropService.deleteDrop(id);
      addToast({ title: 'Drop Removed', message: `Removed "${dropTitle}"`, type: 'info' });
      loadAll();
    } catch (err) {
      addToast({ title: 'Delete Error', message: 'Could not delete drop', type: 'error' });
    }
  };

  const handleTogglePublish = async (drop: DropType) => {
    try {
      await dropService.updateDrop(drop.id, { published: !drop.published });
      addToast({
        title: drop.published ? 'Drop Unpublished' : 'Drop Published',
        message: `Updated visibility for "${drop.title}"`,
        type: 'info',
      });
      loadAll();
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to update visibility', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121212] border border-[#222]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#d4ff00]" />
            <h2 className="text-lg font-mono font-bold uppercase tracking-tight text-white">
              ELIX DROP PLATFORM REPOSITORY
            </h2>
          </div>
          <p className="text-xs text-gray-400 font-sans">
            Configure limited-edition capsule drops, schedule server countdown timestamps, and
            allocate exclusive inventory quantities.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-[#d4ff00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#bce400] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          CREATE NEW DROP
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#d4ff00] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-xs text-gray-400 uppercase tracking-widest">
            FETCHING REGISTERED DROPS...
          </p>
        </div>
      ) : drops.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121212] border border-[#222] space-y-3">
          <Flame className="w-10 h-10 text-gray-600 mx-auto" />
          <p className="text-sm font-mono text-gray-400">NO DROPS REGISTERED YET</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-lg bg-[#d4ff00] text-black font-mono text-xs font-bold uppercase"
          >
            CREATE FIRST DROP
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drops.map((drop) => (
            <div
              key={drop.id}
              className="rounded-2xl bg-[#121212] border border-[#222] overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-44 bg-[#181818] overflow-hidden">
                <img
                  src={drop.banner || '/images/hero-drop.jpg'}
                  alt={drop.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${
                      drop.status === 'Live'
                        ? 'bg-emerald-500 text-black'
                        : drop.status === 'Upcoming'
                        ? 'bg-[#d4ff00] text-black'
                        : 'bg-[#222] text-gray-300'
                    }`}
                  >
                    {drop.status}
                  </span>
                  {!drop.published && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950 text-red-300 border border-red-800 uppercase">
                      UNPUBLISHED
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-mono text-sm font-bold text-white uppercase line-clamp-1">
                    {drop.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2">{drop.description}</p>
                  <p className="text-[11px] font-mono text-[#d4ff00]">
                    Launch: {new Date(drop.scheduledAt).toLocaleString()} ({drop.timezone})
                  </p>
                  <p className="text-[11px] font-mono text-gray-400">
                    Silhouettes included: {drop.products?.length || 0}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#222] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTogglePublish(drop)}
                    className="text-[11px] font-mono text-gray-400 hover:text-white uppercase"
                  >
                    {drop.published ? 'Hide' : 'Publish'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(drop)}
                      className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#222] text-gray-300 hover:text-white transition-colors"
                      title="Edit Drop"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(drop.id, drop.title)}
                      className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-red-950/60 text-gray-300 hover:text-red-400 transition-colors"
                      title="Delete Drop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#121212] border border-[#2a2a2a] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#1c1c1c] text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-mono font-bold uppercase text-white">
                {editingDrop ? 'EDIT DROP RELEASE' : 'CREATE NEW STREETWEAR DROP'}
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Server-authoritative release schedule and variant configuration
              </p>
            </div>

            <form onSubmit={handleSaveDrop} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-gray-400 uppercase tracking-widest block">Drop Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ELIX DROP 002 // CYBER WARFARE"
                  className="w-full bg-[#080808] border border-[#282828] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4ff00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-400 uppercase tracking-widest block">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="auto-generated-if-empty"
                    className="w-full bg-[#080808] border border-[#282828] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4ff00]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 uppercase tracking-widest block">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#080808] border border-[#282828] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4ff00]"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Upcoming">Upcoming (Countdown Active)</option>
                    <option value="Live">Live (Purchasable)</option>
                    <option value="SoldOut">Sold Out</option>
                    <option value="Ended">Ended</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 uppercase tracking-widest block">
                  Description & Story
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Streetwear release notes, fabric specifications, batch edition..."
                  className="w-full bg-[#080808] border border-[#282828] rounded-xl p-4 text-white focus:outline-none focus:border-[#d4ff00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-400 uppercase tracking-widest block">
                    Launch Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full bg-[#080808] border border-[#282828] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4ff00]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 uppercase tracking-widest block">Timezone</label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="Asia/Colombo"
                    className="w-full bg-[#080808] border border-[#282828] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4ff00]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 uppercase tracking-widest block">
                  Banner Image URL
                </label>
                <input
                  type="text"
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  className="w-full bg-[#080808] border border-[#282828] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4ff00]"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-[#222]">
                <label className="text-gray-400 uppercase tracking-widest block">
                  Select Products to Include in Drop ({selectedProductIds.length} selected)
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1 p-2 rounded-xl bg-[#080808] border border-[#222]">
                  {products.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedProductIds((prev) => prev.filter((id) => id !== p.id));
                          } else {
                            setSelectedProductIds((prev) => [...prev, p.id]);
                          }
                        }}
                        className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#d4ff00]/20 text-[#d4ff00]' : 'hover:bg-[#1a1a1a] text-gray-300'
                        }`}
                      >
                        <span className="font-bold">{p.name}</span>
                        <span>LKR {p.price.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-400 uppercase tracking-widest block">
                    Exclusive Stock Per Item
                  </label>
                  <input
                    type="number"
                    value={exclusiveStock}
                    onChange={(e) => setExclusiveStock(Number(e.target.value))}
                    className="w-full bg-[#080808] border border-[#282828] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4ff00]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 uppercase tracking-widest block">
                    Drop Special Price (Optional)
                  </label>
                  <input
                    type="number"
                    value={dropPrice}
                    onChange={(e) => setDropPrice(e.target.value)}
                    placeholder="Regular catalog price"
                    className="w-full bg-[#080808] border border-[#282828] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d4ff00]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="publishedCheck"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded accent-[#d4ff00]"
                />
                <label htmlFor="publishedCheck" className="text-gray-300">
                  Publish drop immediately (visible on customer platform)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#1c1c1c] text-gray-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#d4ff00] text-black font-bold uppercase tracking-wider hover:bg-[#bce400]"
                >
                  {editingDrop ? 'SAVE CHANGES' : 'CREATE DROP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDropsView;

