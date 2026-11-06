import { X, Plus, Minus, ShoppingCart, Trash2, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { toast } from 'react-toastify';

export function Cart() {
  const { items, removeItem, updateQuantity, total, isOpen, setIsOpen, clearCart } = useCart();
  const [isOrdering, setIsOrdering] = useState(false);

  const handleOrder = async () => {
    if (!window.confirm('¿Estás seguro de realizar el pedido?')) return;

    try {
      setIsOrdering(true);
      const message = items
        .map(item =>
          `• ${item.quantity}x ${item.product.name} - C$${(item.product.price * item.quantity).toFixed(2)}`
        )
        .join('\n');

      const totalMessage = `\n\nTotal: C$${total.toFixed(2)}`;
      const encodedMessage = encodeURIComponent(`¡Hola! Me gustaría ordenar:\n${message}${totalMessage}`);

      window.open(`https://wa.me/50578364365?text=${encodedMessage}`, '_blank');
      clearCart();
      setIsOpen(false);
      toast.success('¡Pedido enviado exitosamente!');
    } catch {
      toast.error('Error al procesar el pedido');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <>
      {/* Cart modal with animation */}
      {isOpen && (
        <div className="cart-panel fixed inset-0 z-[100] overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/45 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md animate-slide-in-right">
              <div className="h-full flex flex-col bg-white shadow-2xl border-l border-slate-200">
                <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-200 bg-teal-700 text-white">
                  <h2 className="text-xl font-bold flex items-center">
                    <ShoppingCart className="mr-3 w-6 h-6" />
                    Carrito de Compras
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Cerrar carrito"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Contenido del carrito */}
                <div className="flex-grow overflow-y-auto p-4">
                  {items.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <ShoppingCart className="mx-auto mb-4 h-12 w-12 opacity-50" />
                      <p>Tu carrito está vacío</p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
                            clearCart();
                          }
                        }}
                        className="mb-6 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center transition-all duration-200"
                      >
                        <Trash2 className="mr-2" size={16} />
                        Vaciar carrito
                      </button>
                      {items.map((item, index) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between bg-slate-50 rounded-xl border border-slate-200 p-3 sm:p-4 mb-3 hover:border-teal-200 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] animate-bounce-in"
                          style={{ animationDelay: `${index * 60}ms` }}
                        >
                          <div className="flex items-center flex-1">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="h-16 w-16 rounded-lg border border-slate-200 bg-white object-contain p-1 mr-4"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 text-sm">{item.product.name}</h3>
                              <p className="text-teal-700 font-bold">C${item.product.price.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center bg-white rounded-lg shadow-sm">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors disabled:opacity-50"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-3 py-2 font-semibold text-sm min-w-[2rem] text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-50"
                                disabled={item.quantity >= item.product.stock}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all hover:animate-shake"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Total and order button */}
                {items.length > 0 && (
                  <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-5 p-4 bg-white rounded-xl border border-slate-200">
                      <span className="text-base font-semibold text-slate-600">Total</span>
                      <span key={total.toFixed(2)} className="text-2xl font-bold text-teal-700 inline-block animate-pop">C${total.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleOrder}
                      disabled={isOrdering}
                      className="w-full bg-teal-600 text-white py-3.5 rounded-xl
                               hover:bg-teal-700 transition-colors
                               flex items-center justify-center disabled:opacity-50 shadow-sm font-semibold
                               active:scale-[0.98]"
                    >
                      {isOrdering ? (
                        <Loader className="animate-spin mr-2" size={20} />
                      ) : (
                        <ShoppingCart className="mr-2" size={20} />
                      )}
                      {isOrdering ? 'Procesando...' : 'Ordenar por WhatsApp'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
