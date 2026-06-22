import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useLogout } from '@/hooks/auth/useLogout'
import { Dropdown } from 'antd'
import type { MenuProps } from 'antd'

interface SidebarProps {
  className?: string
}

export default function CityParkSidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeSport = searchParams.get('sport')
  const [categories, setCategories] = useState<string[]>([])
  
  // Modal states for CRUD Category operations
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")

  const getStoredCategories = (): string[] => {
    if (typeof window === 'undefined') return ['Tennis', 'Football', 'Cricket', 'Badminton', 'Aquatics']
    const stored = localStorage.getItem('cityparkon_categories')
    if (!stored) {
      const defaults = ['Tennis', 'Football', 'Cricket', 'Badminton', 'Aquatics']
      localStorage.setItem('cityparkon_categories', JSON.stringify(defaults))
      return defaults
    }
    try {
      return JSON.parse(stored)
    } catch {
      return ['Tennis', 'Football', 'Cricket', 'Badminton', 'Aquatics']
    }
  }

  const saveCategories = (cats: string[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('cityparkon_categories', JSON.stringify(cats))
  }

  useEffect(() => {
    const loadCategories = () => {
      setCategories(getStoredCategories())
    }
    loadCategories()
    window.addEventListener('categories-changed', loadCategories)
    return () => {
      window.removeEventListener('categories-changed', loadCategories)
    }
  }, [])

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      alert("This category already exists!")
      return
    }
    const updated = [...categories, trimmed]
    setCategories(updated)
    saveCategories(updated)
    setNewCategoryName("")
    window.dispatchEvent(new Event('categories-changed'))
  }

  const handleEditCategory = (index: number) => {
    const oldName = categories[index]
    const newName = editCategoryName.trim()
    if (!newName || oldName === newName) {
      setEditingCategoryIndex(null)
      return
    }
    if (categories.some((c, idx) => idx !== index && c.toLowerCase() === newName.toLowerCase())) {
      alert("This category already exists!")
      return
    }
    const updated = [...categories]
    updated[index] = newName
    setCategories(updated)
    saveCategories(updated)

    // Update matching facilities in localStorage
    const storedFacs = localStorage.getItem('cityparkon_facilities')
    if (storedFacs) {
      try {
        const facs = JSON.parse(storedFacs)
        const updatedFacs = facs.map((f: any) => {
          if (f.sportType.toLowerCase() === oldName.toLowerCase()) {
            return { ...f, sportType: newName }
          }
          return f
        })
        localStorage.setItem('cityparkon_facilities', JSON.stringify(updatedFacs))
      } catch (e) {
        console.error(e)
      }
    }

    setEditingCategoryIndex(null)
    window.dispatchEvent(new Event('categories-changed'))
  }

  const handleDeleteCategory = (index: number) => {
    const categoryToDelete = categories[index]
    if (window.confirm(`Are you sure you want to delete "${categoryToDelete}" category?`)) {
      const updated = categories.filter((_, idx) => idx !== index)
      setCategories(updated)
      saveCategories(updated)

      // Optionally update facilities of this sport type to unassigned
      const storedFacs = localStorage.getItem('cityparkon_facilities')
      if (storedFacs) {
        try {
          const facs = JSON.parse(storedFacs)
          const updatedFacs = facs.map((f: any) => {
            if (f.sportType.toLowerCase() === categoryToDelete.toLowerCase()) {
              return { ...f, sportType: 'Unassigned' }
            }
            return f
          })
          localStorage.setItem('cityparkon_facilities', JSON.stringify(updatedFacs))
        } catch (e) {
          console.error(e)
        }
      }

      window.dispatchEvent(new Event('categories-changed'))
    }
  }

  const navItems = [
    { name: 'Parks', icon: "\uEA63", href: '/parks' },
    { name: 'Amenities', icon: "\uEA2F", href: '#' },
  ]

  const logout = useLogout()

  const bottomItems = [
    { name: 'Help Center', icon: "\uE8FD", href: '#', isLogout: false },
  ]

  return (
    <>


      <aside className={`fixed left-0 top-0 h-full w-[260px] bg-white border-r border-[#bdcaba]/40 flex flex-col py-6 px-4 z-50 ${className}`}>
        {/* Brand Header */}
        <div className="mb-8 px-2">
          <div className="flex items-center h-12 py-1.5 bg-white px-4 rounded-xl w-full overflow-hidden shadow-sm border border-[#bdcaba]/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="SpaceEZ Logo"
              className="h-8 object-contain mx-auto"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item, idx) => {
            if (item.name === 'Amenities') {
              const isActive = pathname?.startsWith('/parks') && activeSport !== null

              const menuItems: MenuProps['items'] = [
                ...categories.map((sport) => ({
                  key: sport,
                  label: (
                    <Link
                      href={`/parks?sport=${sport}`}
                      className={`text-xs font-semibold px-2 py-1 block rounded ${
                        activeSport?.toLowerCase() === sport.toLowerCase()
                          ? 'text-[#006b2c] bg-[#eff4ff]/60 font-bold'
                          : 'text-slate-600 hover:text-[#0b1c30]'
                      }`}
                    >
                      {sport}
                    </Link>
                  ),
                })),
                {
                  type: 'divider',
                },
                {
                  key: 'manage',
                  label: (
                    <button
                      onClick={() => setShowCategoryModal(true)}
                      className="w-full flex items-center gap-2 py-1.5 px-2 text-xs text-[#0b1c30] hover:bg-slate-50 font-bold rounded transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-[14px] text-slate-500">settings</span>
                      <span>Manage Categories</span>
                    </button>
                  ),
                }
              ];

              return (
                <div key={idx} className="space-y-1">
                  <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                    <button
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-[#eff4ff] text-[#006b2c] font-semibold shadow-sm'
                          : 'text-[#545f73] hover:bg-[#eff4ff]/40 hover:text-[#0b1c30]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-2 bottom-2 w-1 bg-[#006b2c] rounded-r"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                        <span
                          className={`material-symbols-outlined transition-colors duration-200 ${
                            isActive ? 'text-[#006b2c]' : 'text-[#545f73] group-hover:text-[#006b2c]'
                          }`}
                          style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {item.icon}
                        </span>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="material-symbols-outlined text-xs text-slate-400">
                        {"\uE5CF"}
                      </span>
                    </button>
                  </Dropdown>
                </div>
              )
            }

            const isActive =
              item.href === '/parks' && pathname?.startsWith('/parks') && activeSport === null

            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#eff4ff] text-[#006b2c] font-semibold shadow-sm'
                    : 'text-[#545f73] hover:bg-[#eff4ff]/40 hover:text-[#0b1c30]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-[#006b2c] rounded-r"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span
                  className={`material-symbols-outlined transition-colors duration-200 ${
                    isActive ? 'text-[#006b2c]' : 'text-[#545f73] group-hover:text-[#006b2c]'
                  }`}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer Area */}
        <div className="pt-4 border-t border-[#bdcaba]/30 space-y-1">
          {bottomItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all duration-200 group text-[#545f73] hover:bg-[#eff4ff]/40 hover:text-[#0b1c30]"
            >
              <span className="material-symbols-outlined text-[#545f73]">
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50"
          >
            <span className="material-symbols-outlined text-red-500">{"\uE9BA"}</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Category Manager Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-100"
            >
              {/* Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006b2c] text-xl">category</span>
                  <h3 className="font-bold text-[#0c1c30] text-base">Manage Sport Categories</h3>
                </div>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center p-1 rounded-full hover:bg-slate-200/50"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Add New Category Form */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#545f73] uppercase tracking-wider block">
                    Add New Category
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Basketball, Squash..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#006b2c] transition-colors"
                    />
                    <button
                      onClick={handleAddCategory}
                      className="bg-[#006b2c] hover:bg-[#005221] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      Add
                    </button>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Categories List */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#545f73] uppercase tracking-wider block mb-2">
                    Existing Categories ({categories.length})
                  </label>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {categories.map((cat, index) => {
                      const isEditing = editingCategoryIndex === index;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-2 flex-1 mr-2">
                              <input
                                type="text"
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                                className="flex-1 text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-[#006b2c] bg-white font-medium"
                                autoFocus
                              />
                              <button
                                onClick={() => handleEditCategory(index)}
                                className="text-emerald-600 hover:text-emerald-700 transition-colors shrink-0"
                              >
                                <span className="material-symbols-outlined text-lg">check</span>
                              </button>
                              <button
                                onClick={() => setEditingCategoryIndex(null)}
                                className="text-slate-400 hover:text-slate-500 transition-colors shrink-0"
                              >
                                <span className="material-symbols-outlined text-lg">close</span>
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-xs font-medium text-slate-700">{cat}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingCategoryIndex(index);
                                    setEditCategoryName(cat);
                                  }}
                                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded transition-colors"
                                  title="Edit category"
                                >
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(index)}
                                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete category"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}

                    {categories.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-4">
                        No categories found. Add one above.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
