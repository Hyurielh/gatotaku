const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/StoreFront-D5VZNqy6.js","assets/vendor-CSCu1ICB.js","assets/About-CFFOLG1q.js","assets/LoginPage-CGGnmgG-.js","assets/AdminPanel-CPviQBJ0.js","assets/Information-CZCK_Jav.js"])))=>i.map(i=>d[i]);
import{c as P,r as m,j as e,H as T,u as F,a as S,L as d,F as y,b as w,d as C,e as k,f as R,g as L,S as _,X as E,M as z,P as M,N as q,R as $,h as g,_ as b,Q as U,i as J,k as G,l as H,m as K}from"./vendor-CSCu1ICB.js";(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))x(t);new MutationObserver(t=>{for(const a of t)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&x(i)}).observe(document,{childList:!0,subtree:!0});function o(t){const a={};return t.integrity&&(a.integrity=t.integrity),t.referrerPolicy&&(a.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?a.credentials="include":t.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function x(t){if(t.ep)return;t.ep=!0;const a=o(t);fetch(t.href,a)}})();const Q="https://qpxjmkwebtehwbxbsefs.supabase.co",V="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFweGpta3dlYnRlaHdieGJzZWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MTYxNjgsImV4cCI6MjA1MjE5MjE2OH0.p4ucPBRNkK6oKPblq28DKpk8SyuugESfhFohJoPGyBQ",v=P(Q,V,{auth:{autoRefreshToken:!0,persistSession:!0,detectSessionInUrl:!0}}),A=m.createContext({session:null,loading:!0,logout:async()=>{}});function W({children:s}){const[r,o]=m.useState(null),[x,t]=m.useState(!0),a=async()=>{try{const{error:i}=await v.auth.signOut();if(i)throw console.error("Error al cerrar sesión:",i),i;o(null)}catch(i){throw console.error("Error al cerrar sesión:",i),i}};return m.useEffect(()=>{(async()=>{try{const{data:{session:n}}=await v.auth.getSession();o(n)}catch(n){console.error("Error al obtener la sesión:",n)}finally{t(!1)}})();const{data:{subscription:u}}=v.auth.onAuthStateChange((n,f)=>{o(f),t(!1)});return()=>{u.unsubscribe()}},[]),e.jsx(A.Provider,{value:{session:r,loading:x,logout:a},children:s})}function I(){const s=m.useContext(A);if(s===void 0)throw new Error("useAuth must be used within an AuthProvider");return s}const O=m.createContext(void 0);function D({children:s}){const[r,o]=m.useState([]),[x,t]=m.useState(!1),a=c=>{o(l=>{const h=l.find(p=>p.product.id===c.id);return h?h.quantity>=c.stock?l:l.map(p=>p.product.id===c.id?{...p,quantity:Math.min(p.quantity+1,c.stock)}:p):[...l,{product:c,quantity:1}]}),t(!0)},i=c=>{o(l=>l.filter(h=>h.product.id!==c))},u=(c,l)=>{l<1||o(h=>{const p=h.find(j=>j.product.id===c);return!p||l>p.product.stock?h:h.map(j=>j.product.id===c?{...j,quantity:l}:j)})},n=()=>{o([]),t(!1)},f=r.reduce((c,l)=>c+l.product.price*l.quantity,0);return e.jsx(O.Provider,{value:{items:r,addItem:a,removeItem:i,updateQuantity:u,clearCart:n,total:f,isOpen:x,setIsOpen:t},children:s})}function B(){const s=m.useContext(O);if(s===void 0)throw new Error("useCart must be used within a CartProvider");return s}function Y({title:s,description:r,image:o,url:x}){const t="Gatotaku - Tu Tienda de Anime",a=s===t?s:`${s} | ${t}`,i="logo.png",u="";return e.jsxs(T,{children:[e.jsx("title",{children:a}),e.jsx("meta",{name:"description",content:r}),e.jsx("meta",{property:"og:type",content:"website"}),e.jsx("meta",{property:"og:title",content:a}),e.jsx("meta",{property:"og:description",content:r}),e.jsx("meta",{property:"og:image",content:o||i}),e.jsx("meta",{property:"og:url",content:x||u}),e.jsx("meta",{name:"twitter:card",content:"summary_large_image"}),e.jsx("meta",{name:"twitter:title",content:a}),e.jsx("meta",{name:"twitter:description",content:r}),e.jsx("meta",{name:"twitter:image",content:o||i}),e.jsx("meta",{name:"viewport",content:"width=device-width, initial-scale=1.0"}),e.jsx("meta",{name:"theme-color",content:"#f97316"})," ",e.jsx("link",{rel:"canonical",href:x||u})]})}const Z=()=>{const[s,r]=m.useState(!1),{session:o,logout:x}=I(),t=F(),a=S(),i=()=>{r(!s)},u=async()=>{try{await x(),t("/")}catch(c){console.error("Error al cerrar sesión:",c)}},f="https://wa.me/+50578364365";return e.jsxs("header",{className:"bg-black text-white sticky top-0 z-50",children:[e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[e.jsxs("div",{className:"flex justify-between items-center h-16",children:[e.jsxs(d,{to:"/",className:"flex items-center",onClick:()=>{window.dispatchEvent(new CustomEvent("reset-store-filters"))},children:[e.jsx("img",{src:"./logo.png",alt:"Logo",className:"w-12 h-12 rounded-full"}),e.jsx("span",{className:"ml-3 text-2xl md:text-3xl font-black tracking-wide text-white",style:{fontFamily:"Poppins",textShadow:"2px 2px 4px rgba(0, 0, 0, 0.3)"},children:"GATOTAKU"})]}),e.jsxs("nav",{className:"hidden md:flex items-center space-x-8",children:[e.jsxs(d,{to:"/",className:"relative group",children:[e.jsx("span",{className:"hover:text-gray-300",children:"Catálogo"}),e.jsx("span",{className:"absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 transition-transform group-hover:scale-x-100"})]}),e.jsxs(d,{to:"/about",className:"relative group",children:[e.jsx("span",{className:"hover:text-gray-300",children:"Sobre Nosotros"}),e.jsx("span",{className:"absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 transition-transform group-hover:scale-x-100"})]}),e.jsxs(d,{to:"/information",className:"relative group",children:[e.jsx("span",{className:"hover:text-gray-300",children:"Información"}),e.jsx("span",{className:"absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 transition-transform group-hover:scale-x-100"})]}),e.jsxs("a",{href:f,target:"_blank",rel:"noopener noreferrer",className:"relative group flex items-center",children:[e.jsxs("span",{className:"hover:text-gray-300 flex items-center",children:[e.jsx(y,{className:"mr-2"}),"WhatsApp"]}),e.jsx("span",{className:"absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 transition-transform group-hover:scale-x-100"})]}),e.jsx(d,{to:"/cart",className:"hover:text-orange-500 transition-colors",children:e.jsx(w,{className:"text-2xl"})}),o&&e.jsx(d,{to:"/admin",className:"hover:text-orange-500 transition-colors",children:e.jsx(C,{className:"text-2xl"})}),a.pathname==="/admin"&&o&&e.jsx("button",{onClick:u,className:"hover:text-orange-500 transition-colors flex items-center",title:"Cerrar sesión",children:e.jsx(k,{className:"text-2xl"})})]}),e.jsx("button",{onClick:i,className:"md:hidden text-white focus:outline-none",children:s?e.jsx(R,{size:24}):e.jsx(L,{size:24})})]}),s&&e.jsx("div",{className:"md:hidden py-4",children:e.jsxs("div",{className:"flex flex-col space-y-4",children:[e.jsx(d,{to:"/",className:"text-white hover:text-orange-500 transition-colors",onClick:()=>r(!1),children:"Catálogo"}),e.jsx(d,{to:"/about",className:"text-white hover:text-orange-500 transition-colors",onClick:()=>r(!1),children:"Sobre Nosotros"}),e.jsx(d,{to:"/information",className:"text-white hover:text-orange-500 transition-colors",onClick:()=>r(!1),children:"Información"}),e.jsxs("a",{href:f,target:"_blank",rel:"noopener noreferrer",className:"text-white hover:text-orange-500 transition-colors flex items-center",onClick:()=>r(!1),children:[e.jsx(y,{className:"mr-2"}),"WhatsApp"]}),o&&e.jsxs(d,{to:"/admin",className:"text-white hover:text-orange-500 transition-colors flex items-center",onClick:()=>r(!1),children:[e.jsx(C,{className:"mr-2"}),"Panel de Admin"]}),a.pathname==="/admin"&&o&&e.jsxs("button",{onClick:u,className:"text-white hover:text-orange-500 transition-colors flex items-center",children:[e.jsx(k,{className:"mr-2"}),"Cerrar Sesión"]})]})})]}),e.jsx("div",{className:"fixed bottom-4 right-4 md:hidden z-50 bg-orange-500 rounded-full p-3 shadow-lg hover:bg-orange-600 transition-colors",children:e.jsx(d,{to:"/cart",children:e.jsx(w,{className:"text-white text-2xl"})})})]})},X=()=>{const s="+50578364365",r=`https://wa.me/${s}`;return e.jsx("footer",{className:"bg-black text-white mt-12",children:e.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6",children:e.jsxs("div",{className:"flex flex-col items-center gap-4",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("img",{src:"./logo.png",alt:"Logo",className:"w-10 h-10 rounded-full"}),e.jsx("span",{className:"text-3xl font-black tracking-wider",style:{fontFamily:"'Poppins', sans-serif"},children:"GATOTAKU"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold mb-2",children:"Enlaces Rápidos"}),e.jsxs("ul",{className:"space-y-2",children:[e.jsx("li",{children:e.jsx(d,{to:"/",className:"hover:text-gray-300",children:"Inicio"})}),e.jsx("li",{children:e.jsx(d,{to:"/about",className:"hover:text-gray-300",children:"Sobre Nosotros"})}),e.jsx("li",{children:e.jsxs("a",{href:r,target:"_blank",rel:"noopener noreferrer",className:"flex items-center hover:text-gray-300",children:[e.jsx(y,{className:"mr-2"}),"Contáctenos"]})})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold mb-2",children:"Información"}),e.jsxs("ul",{className:"space-y-2",children:[e.jsx("li",{children:e.jsx(d,{to:"/information/payment-methods",className:"hover:text-gray-300",children:"Métodos de pago"})}),e.jsx("li",{children:e.jsx(d,{to:"/information/shipping",className:"hover:text-gray-300",children:"Envíos"})}),e.jsx("li",{children:e.jsx(d,{to:"/information/refunds",className:"hover:text-gray-300",children:"Reembolsos"})})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold mb-2",children:"Contacto"}),e.jsxs("ul",{className:"space-y-2",children:[e.jsxs("li",{children:["WhatsApp: ",s]}),e.jsx("li",{children:"Email: gatotaku2022@gmail.com"})]})]})]})]})})})};function ee(){const{items:s,removeItem:r,updateQuantity:o,total:x,isOpen:t,setIsOpen:a,clearCart:i}=B();S();const u=()=>{const n=s.map(l=>`• ${l.quantity}x ${l.product.name} - C$${(l.product.price*l.quantity).toFixed(2)}`).join(`
`),f=`

Total: C$${x.toFixed(2)}`,c=encodeURIComponent(`¡Hola! Me gustaría ordenar:
${n}${f}`);window.open(`https://wa.me/50578364365?text=${c}`,"_blank"),i()};return e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:()=>a(!0),className:"fixed bottom-4 right-4 z-50 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-900 transition-colors","aria-label":"Abrir carrito",children:e.jsxs("div",{className:"relative",children:[e.jsx(_,{size:24}),s.length>0&&e.jsx("span",{className:"absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center",children:s.length})]})}),t&&e.jsxs("div",{className:"fixed inset-0 z-[100] overflow-hidden",children:[e.jsx("div",{className:"absolute inset-0 bg-black bg-opacity-50",onClick:()=>a(!1)}),e.jsx("div",{className:"fixed inset-y-0 right-0 max-w-full flex",children:e.jsx("div",{className:"w-screen max-w-md",children:e.jsxs("div",{className:"h-full flex flex-col bg-white shadow-xl",children:[e.jsxs("div",{className:"flex justify-between items-center p-4 border-b",children:[e.jsxs("h2",{className:"text-xl font-bold flex items-center",children:[e.jsx(_,{className:"mr-2"}),"Carrito de Compras"]}),e.jsx("button",{onClick:()=>a(!1),className:"p-2 hover:bg-gray-100 rounded-full","aria-label":"Cerrar carrito",children:e.jsx(E,{})})]}),e.jsx("div",{className:"flex-grow overflow-y-auto p-4",children:s.length===0?e.jsx("p",{className:"text-center text-gray-500",children:"Tu carrito está vacío"}):s.map(n=>e.jsxs("div",{className:"flex items-center justify-between border-b py-2",children:[e.jsxs("div",{className:"flex items-center",children:[e.jsx("img",{src:n.product.images[0],alt:n.product.name,className:"w-16 h-16 object-cover mr-4"}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-bold",children:n.product.name}),e.jsxs("p",{children:["C$",n.product.price.toFixed(2)]})]})]}),e.jsxs("div",{className:"flex items-center",children:[e.jsx("button",{onClick:()=>o(n.product.id,n.quantity-1),className:"p-1 bg-gray-200 rounded-l",disabled:n.quantity<=1,children:e.jsx(z,{size:16})}),e.jsx("span",{className:"px-3 py-1 bg-gray-100",children:n.quantity}),e.jsx("button",{onClick:()=>o(n.product.id,n.quantity+1),className:"p-1 bg-gray-200 rounded-r",disabled:n.quantity>=n.product.stock,children:e.jsx(M,{size:16})}),e.jsx("button",{onClick:()=>r(n.product.id),className:"ml-2 text-red-500 hover:text-red-700",children:e.jsx(E,{size:16})})]})]},n.product.id))}),s.length>0&&e.jsxs("div",{className:"p-4 border-t",children:[e.jsxs("div",{className:"flex justify-between mb-4",children:[e.jsx("span",{className:"font-bold",children:"Total:"}),e.jsxs("span",{children:["C$",x.toFixed(2)]})]}),e.jsx("button",{onClick:u,className:"w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors",children:"Ordenar por WhatsApp"})]})]})})})]})]})}function se({children:s}){const{session:r,loading:o}=I();return o?e.jsx("div",{className:"min-h-screen flex items-center justify-center",children:e.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"})}):r?e.jsx(e.Fragment,{children:s}):e.jsx(q,{to:"/login",replace:!0})}const te=()=>e.jsx("div",{className:"min-h-screen flex items-center justify-center",children:e.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"})}),N=s=>{const r=m.lazy(s);return e.jsx(m.Suspense,{fallback:e.jsx(te,{}),children:e.jsx(r,{})})},re=()=>e.jsxs($,{children:[e.jsx(g,{path:"/",element:N(()=>b(()=>import("./StoreFront-D5VZNqy6.js"),__vite__mapDeps([0,1])))}),e.jsx(g,{path:"/about",element:N(()=>b(()=>import("./About-CFFOLG1q.js"),__vite__mapDeps([2,1])))}),e.jsx(g,{path:"/login",element:N(()=>b(()=>import("./LoginPage-CGGnmgG-.js"),__vite__mapDeps([3,1])))}),e.jsx(g,{path:"/admin",element:e.jsx(se,{children:N(()=>b(()=>import("./AdminPanel-CPviQBJ0.js"),__vite__mapDeps([4,1])))})}),e.jsx(g,{path:"/information/*",element:N(()=>b(()=>import("./Information-CZCK_Jav.js"),__vite__mapDeps([5,1,2])))})]}),ae=new U({defaultOptions:{queries:{staleTime:5*60*1e3,gcTime:30*60*1e3,retry:1,refetchOnWindowFocus:!1,refetchOnReconnect:!0}}});function ne(){return e.jsx(J,{client:ae,children:e.jsx(G,{children:e.jsxs("div",{className:"min-h-screen bg-gray-100",children:[e.jsx(Y,{title:"GATOTAKU - Tu Tienda de Anime",description:"Tienda online de productos de anime y manga. Encuentra los mejores artículos de tus series favoritas."}),e.jsx(W,{children:e.jsx(D,{children:e.jsx(H,{future:{v7_startTransition:!0,v7_relativeSplatPath:!0},children:e.jsxs("div",{className:"flex flex-col min-h-screen",children:[e.jsx(Z,{}),e.jsx("main",{className:"flex-grow",children:e.jsx(re,{})}),e.jsx(X,{}),e.jsx(ee,{})]})})})})]})})})}K.createRoot(document.getElementById("root")).render(e.jsx(m.StrictMode,{children:e.jsx(ne,{})}));export{ee as C,Y as S,I as a,v as s,B as u};
