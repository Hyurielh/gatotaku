import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function Cart() {
  const { items, removeItem, updateQuantity, total, isOpen, setIsOpen, clearCart } = useCart();

  const handleOrder = () => {
    // Crear el mensaje para WhatsApp
    const message = items
      .map(
        item =>
          `• ${item.quantity}x ${item.product.name} - C$${(
            item.product.price * item.quantity
          ).toFixed(2)}`
      )
      .join('\n');

    const totalMessage = `\n\nTotal: C$${total.toFixed(2)}`;
    const encodedMessage = encodeURIComponent(`¡Hola! Me gustaría ordenar:\n${message}${totalMessage}`);
    
    // Abrir WhatsApp
    window.open(`https://wa.me/50578364365?text=${encodedMessage}`, '_blank');
    clearCart();
  };

  return (
    <>
      {/* Botón flotante del carrito */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-900 transition-colors"
        aria-label="Abrir carrito"
      >
        <div className="relative">
          <ShoppingBag size={24} />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {items.length}
            </span>
          )}
        </div>
      </button>

      {/* Modal del carrito */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          
          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-lg font-semibold flex items-center">
                    <ShoppingBag className="mr-2" />
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

                <div className="flex-1 overflow-y-auto p-4">
                  {items.length === 0 ? (
                    <p className="text-center text-gray-500">El carrito está vacío</p>
                  ) : (
                    <ul className="space-y-4">
                      {items.map((item) => (
                        <li key={item.product.id} className="flex items-center space-x-4 bg-white rounded-lg p-2 shadow-sm">
                          <img
                            src={item.product.images[0] || 'https://via.placeholder.com/100'}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{item.product.name}</h3>
                            <p className="text-sm text-gray-500">
                              C${item.product.price.toFixed(2)}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="p-1 hover:bg-gray-100 rounded"
                                aria-label="Reducir cantidad"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="p-1 hover:bg-gray-100 rounded"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
                            aria-label="Eliminar del carrito"
                          >
                            <X size={20} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="border-t p-4 bg-white">
                    <div className="flex justify-between items-center font-semibold mb-4">
                      <span>Total:</span>
                      <span>C${total.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleOrder}
                      className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors"
                    >
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
