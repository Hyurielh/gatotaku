import { X, Plus, Minus, ShoppingCart, Trash2, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';

export function Cart() {
  const { items, removeItem, updateQuantity, total, isOpen, setIsOpen, clearCart } = useCart();
  const [isOrdering, setIsOrdering] = useState(false);
  const location = useLocation();

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
      {/* Cart button with animation */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[7.5rem] right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 lg:bottom-10 lg:right-10 z-50 
                 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full shadow-lg hover:bg-black/70 
                 transition-all duration-300 hover:scale-110"
        aria-label="Abrir carrito"
      >
        <div className="relative">
          <ShoppingCart className="text-white text-2xl opacity-80" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
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
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-bold flex items-center">
                    <ShoppingCart className="mr-2" />
                    Carrito de Compras
                  </h2>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                    aria-label="Cerrar carrito"
                  >
                    <X />
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
                        className="mb-4 text-red-500 hover:text-red-700 flex items-center"
                      >
                        <Trash2 className="mr-2" size={16} />
                        Vaciar carrito
                      </button>
                      {items.map((item) => (
                        <div 
                          key={item.product.id} 
                          className="flex items-center justify-between border-b py-2"
                        >
                          <div className="flex items-center">
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product.name} 
                              className="w-16 h-16 object-cover mr-4"
                            />
                            <div>
                              <h3 className="font-bold">{item.product.name}</h3>
                              <p>C${item.product.price.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 bg-gray-200 rounded-l"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-3 py-1 bg-gray-100">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 bg-gray-200 rounded-r"
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus size={16} />
                            </button>
                            <button 
                              onClick={() => removeItem(item.product.id)}
                              className="ml-2 text-red-500 hover:text-red-700"
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
                  <div className="p-4 border-t">
                    <div className="flex justify-between mb-4">
                      <span className="font-bold">Total:</span>
                      <span>C${total.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleOrder}
                      disabled={isOrdering}
                      className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 
                               transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      {isOrdering ? (
                        <Loader className="animate-spin mr-2" size={16} />
                      ) : null}
                      Ordenar por WhatsApp
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
