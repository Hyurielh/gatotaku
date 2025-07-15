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
    } catch (error) {
      toast.error('Error al procesar el pedido');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <>
      {/* Cart button with improved design */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-16 right-4 sm:bottom-20 sm:right-6 md:bottom-24 md:right-8 z-50 
                 bg-orange-500 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-xl 
                 hover:bg-orange-600 transition-all duration-300 hover:scale-105 
                 border-3 border-white flex items-center justify-center"
        aria-label="Abrir carrito"
      >
        <div className="relative">
          <ShoppingCart className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
              {items.length}
            </span>
          )}
        </div>
      </button>

      {/* Cart modal with animation */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md transform transition-transform duration-300 translate-x-0">
              <div className="h-full flex flex-col bg-white shadow-xl rounded-l-2xl">
                <div className="flex justify-between items-center p-6 bg-orange-500 text-white rounded-tl-2xl">
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
                        className="mb-6 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center transition-all duration-200"
                      >
                        <Trash2 className="mr-2" size={16} />
                        Vaciar carrito
                      </button>
                      {items.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-3 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center flex-1">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg mr-4 shadow-sm"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 text-sm">{item.product.name}</h3>
                              <p className="text-orange-600 font-bold">C${item.product.price.toFixed(2)}</p>
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
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
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
                  <div className="p-6 bg-gray-50 border-t">
                    <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-sm border-2 border-orange-100">
                      <span className="text-lg font-bold text-gray-800">Total:</span>
                      <span className="text-2xl font-bold text-orange-600">C${total.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleOrder}
                      disabled={isOrdering}
                      className="w-full bg-green-500 text-white py-4 rounded-xl 
                               hover:bg-green-600 transition-all duration-300 
                               flex items-center justify-center disabled:opacity-50 shadow-lg font-semibold text-lg
                               transform hover:scale-[1.02] active:scale-[0.98]"
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
