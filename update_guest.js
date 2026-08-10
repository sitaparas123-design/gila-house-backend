const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../Frontend/src/pages/website/GuestMenu.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace Tabs
content = content.replace(
  /\{tabs\.map\(\(tab\) => \([\s\S]*?\}\)/g,
  `{categoriesList.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={\`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap \${
                activeTab === tab 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-100' 
                : 'bg-surface text-gray-400 hover:bg-gray-50'
              }\`}
            >
              {tab} {categoryIconMap[tab.toLowerCase()] || ''}
            </button>
          ))}`
);

// Replace filteredMenu loop content
content = content.replace(
  /\{item\.icon\}/g,
  `{item.image_url ? (
                     <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                     categoryIconMap[(item.category_name || item.category)?.toLowerCase()] || '🍽️'
                  )}`
);

content = content.replace(
  /\{item\.desc\}/g,
  `{item.description || item.desc || ''}`
);

content = content.replace(
  /\{item\.price\}/g,
  `Rp {Number(item.price).toLocaleString()}`
);

content = content.replace(
  /onClick=\{\(\) => setIsCartOpen\(true\)\}/g,
  `onClick={(e) => {
                    e.stopPropagation();
                    addToCart(item);
                  }}`
);

// Cart Button items count
content = content.replace(
  /<span className="absolute -top-1 -right-1 bg-orange-500 text-white text-\[8px\] w-3\.5 h-3\.5 flex items-center justify-center rounded-full font-black">2<\/span>/g,
  `{cartItemsCount > 0 && <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-black">{cartItemsCount}</span>}`
);

// Floating Checkout Bar
content = content.replace(
  /<p className="text-\[10px\] font-black uppercase tracking-widest opacity-60">2 Items<\/p>/g,
  `<p className="text-[10px] font-black uppercase tracking-widest opacity-60">{cartItemsCount} Items</p>`
);
content = content.replace(
  /<p className="text-lg font-black tracking-tight">Rp 120\.000<\/p>/g,
  `<p className="text-lg font-black tracking-tight">Rp {cartTotal.toLocaleString()}</p>`
);

// Cart Modal Open
// we need to fix the second `setIsCartOpen(true)` in floating bar
content = content.replace(
  /<button \n\s*onClick=\{\(e\) => \{\n\s*e\.stopPropagation\(\);\n\s*addToCart\(item\);\n\s*\}\}\n\s*className="w-full bg-slate-900/g,
  `<button 
           onClick={() => setIsCartOpen(true)}
           className="w-full bg-slate-900`
); // revert the mistaken replace

// Cart Items list
const cartItemsRegex = /<div className="space-y-6 mb-8 max-h-\[30vh\] overflow-y-auto no-scrollbar">[\s\S]*?<\/div>\s*\{\/\* Special Notes \*\/\}/;
content = content.replace(cartItemsRegex, 
`<div className="space-y-6 mb-8 max-h-[30vh] overflow-y-auto no-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-xl overflow-hidden shrink-0">
                           {item.image_url ? <img src={getImageUrl(item.image_url)} className="w-full h-full object-cover" /> : (categoryIconMap[(item.category_name || item.category)?.toLowerCase()] || '🍽️')}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800">{item.name}</h4>
                          <p className="text-[10px] font-bold text-gray-400 tracking-tight">Rp {Number(item.price).toLocaleString()} × {item.qty}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full">
                          <button onClick={() => updateQty(item.id, -1)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Plus size={14} className="rotate-45" />
                          </button>
                          <span className="text-xs font-black">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="text-orange-500">
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-sm font-black text-orange-500 tracking-tight">Rp {(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {cart.length === 0 && <p className="text-center text-gray-400 font-bold text-xs py-4 uppercase tracking-widest">Cart is empty</p>}
                </div>

                {/* Special Notes */}`);

// Cart Modal Total
const cartTotalRegex = /<span className="text-xl font-black text-orange-500 tracking-tighter">Rp 120\.000<\/span>/g;
content = content.replace(cartTotalRegex, `<span className="text-xl font-black text-orange-500 tracking-tighter">Rp {(cartTotal * 1.11).toLocaleString()}</span>`);

// Replace the Total label
content = content.replace(/<span className="text-sm font-black text-slate-800">Total<\/span>/g, `<span className="text-sm font-black text-slate-800">Total (inc 11% tax)</span>`);

// Cart Modal Payment Buttons
content = content.replace(
  /onClick=\{\(\) => \{\s*setIsCartOpen\(false\);\s*setIsPayModalOpen\(true\);\s*\}\}/g,
  `onClick={() => {
                      if (cart.length === 0) return showToastMessage("Cart is empty", "error");
                      setIsCartOpen(false);
                      setIsPayModalOpen(true);
                    }}`
);

content = content.replace(
  /<button className="w-full p-4 rounded-2xl border-2 border-amber-100 bg-amber-50\/10 hover:bg-amber-50 flex items-center gap-4 transition-all text-left">/g,
  `<button 
                    onClick={() => {
                       if (cart.length === 0) return showToastMessage("Cart is empty", "error");
                       submitOrder(false);
                    }}
                    className="w-full p-4 rounded-2xl border-2 border-amber-100 bg-amber-50/10 hover:bg-amber-50 flex items-center gap-4 transition-all text-left">`
);

// Pay Online Modal Content
const payModalContentRegex = /\{\/\* Payment Options \*\/\}\s*<div className="space-y-4">[\s\S]*?<\/div>\s*\{\/\* Pay Later \*\/\}/;
content = content.replace(payModalContentRegex, 
`{/* Payment Options */}
                {paymentState === 'waiting' && invoiceUrl ? (
                  <div className="flex flex-col items-center justify-center space-y-6 py-4">
                     <div className="p-4 bg-white rounded-3xl shadow-sm border-2 border-slate-100 overflow-hidden">
                        {paymentMethod === 'QR Code' ? (
                          <QRCodeSVG value={invoiceUrl} size={200} />
                        ) : (
                          <iframe src={invoiceUrl} className="w-full h-[400px] border-none rounded-xl" />
                        )}
                     </div>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Waiting for Payment...</p>
                  </div>
                ) : paymentState === 'success' ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-12">
                     <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={40} />
                     </div>
                     <h3 className="text-xl font-black text-slate-800">Payment Successful!</h3>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your order is being prepared</p>
                     <button onClick={() => setIsPayModalOpen(false)} className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800">Close</button>
                  </div>
                ) : (
                <div className="space-y-4">
                  <button onClick={() => handleOnlinePayment('Card')} className="w-full p-4 rounded-[1.5rem] border-2 border-orange-100 bg-orange-50/20 hover:bg-orange-50 flex items-center gap-4 transition-all text-left">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800">Pay Online</h4>
                      <p className="text-[9px] font-bold text-gray-400 tracking-tight">Credit card, bank transfer, e-wallet</p>
                    </div>
                  </button>

                  <button onClick={() => handleOnlinePayment('QR Code')} className="w-full p-4 rounded-[1.5rem] border-2 border-emerald-100 bg-emerald-50/10 hover:bg-emerald-50 flex items-center gap-4 transition-all text-left">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 p-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><path d="M14 14h3v3h-3z"/></svg>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800">QRIS</h4>
                      <p className="text-[9px] font-bold text-gray-400 tracking-tight">Scan with any banking or e-wallet app</p>
                    </div>
                  </button>
                </div>
                )}

                {/* Pay Later */}`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done replacing');
