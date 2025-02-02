import{r as f,j as e,n as A,o as w,S as M,E as _,p as $}from"./vendor-CfrxxlCL.js";import{u as L,s as F,S as B}from"./index-Ds3MvDj-.js";function T({onFilterChange:s,currentFilters:h={},categories:v,animes:m,onResetFilters:b}){const[o,c]=f.useState(h),[j,u]=f.useState(!1),x=t=>{const i={...h,...t,page:1};c(i),s(i)},g=t=>{x({category:t.target.value===""?void 0:t.target.value})},p=t=>{x({anime:t.target.value===""?void 0:t.target.value})},y=t=>{const i=t.target.value?parseFloat(t.target.value):void 0;x({minPrice:i})},P=t=>{const i=t.target.value?parseFloat(t.target.value):void 0;x({maxPrice:i})},N=t=>{x({sortBy:t.target.value})},n=t=>{const i=t.target.value;c(l=>({...l,search:i===""?void 0:i})),s({search:i===""?void 0:i})},r=()=>{u(!j)},a=()=>{const t={search:void 0,category:void 0,anime:void 0,minPrice:void 0,maxPrice:void 0,sortBy:"name_asc"};c(t),s(t),b&&b()};return e.jsxs("div",{className:"search-and-filters-container",children:[e.jsxs("div",{className:"filter-group mb-4",children:[e.jsx("label",{htmlFor:"search-input-desktop",className:"block text-sm font-medium text-gray-700 mb-1",children:"Buscar productos"}),e.jsx("input",{id:"search-input-desktop",type:"text",placeholder:"Buscar productos...",value:o.search||"",onChange:n,"aria-label":"Buscar productos por nombre o descripción",className:"block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"})]}),e.jsx("div",{className:"md:hidden flex justify-end mb-4",children:e.jsxs("button",{onClick:r,className:"flex items-center px-4 py-2 bg-orange-500 text-white rounded-md",children:[e.jsx(A,{className:"mr-2"})," Filtros"]})}),e.jsxs("div",{className:`
        additional-filters
        grid grid-cols-1 
        ${j?"grid":"hidden"} 
        md:grid md:grid-cols-2 md:gap-4
      `,children:[e.jsxs("div",{className:"md:flex md:space-x-4 md:col-span-2",children:[e.jsxs("div",{className:"filter-group flex-1",children:[e.jsx("label",{htmlFor:"category-select",className:"block text-sm font-medium text-gray-700 mb-1",children:"Categoría"}),e.jsxs("select",{id:"category-select",value:o.category||"",onChange:g,"aria-label":"Seleccionar categoría de producto",className:"block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500",children:[e.jsx("option",{value:"",children:"Todas las categorías"}),v.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})]}),e.jsxs("div",{className:"filter-group flex-1 ",children:[e.jsx("label",{htmlFor:"anime-select",className:"block text-sm font-medium text-gray-700 mb-1",children:"Anime"}),e.jsxs("select",{id:"anime-select",value:o.anime||"",onChange:p,"aria-label":"Seleccionar anime",className:"block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500",children:[e.jsx("option",{value:"",children:"Todos los Animes"}),m.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})]})]}),e.jsxs("div",{className:"md:flex md:space-x-4 md:col-span-2",children:[e.jsxs("div",{className:"filter-group flex-1",children:[e.jsx("label",{htmlFor:"min-price-input",className:"block text-sm font-medium text-gray-700 mb-1",children:"Precio Mínimo"}),e.jsx("input",{id:"min-price-input",type:"number",placeholder:"Precio mínimo",value:o.minPrice!==void 0?o.minPrice:"",onChange:y,"aria-label":"Filtrar productos por precio mínimo",min:"0",step:"0.01",className:"block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"})]}),e.jsxs("div",{className:"filter-group flex-1",children:[e.jsx("label",{htmlFor:"max-price-input",className:"block text-sm font-medium text-gray-700 mb-1",children:"Precio Máximo"}),e.jsx("input",{id:"max-price-input",type:"number",placeholder:"Precio máximo",value:o.maxPrice!==void 0?o.maxPrice:"",onChange:P,"aria-label":"Filtrar productos por precio máximo",min:"0",step:"0.01",className:"block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"})]})]}),e.jsxs("div",{className:"col-span-full",children:[e.jsx("label",{htmlFor:"sort-select",className:"block text-sm font-medium text-gray-700 mb-1",children:"Ordenar por"}),e.jsxs("select",{id:"sort-select",value:o.sortBy||"name_asc",onChange:N,"aria-label":"Ordenar productos",className:"block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500",children:[e.jsx("option",{value:"name_asc",children:"Nombre A-Z"}),e.jsx("option",{value:"name_desc",children:"Nombre Z-A"}),e.jsx("option",{value:"price_asc",children:"Precio: Menor a Mayor"}),e.jsx("option",{value:"price_desc",children:"Precio: Mayor a Menor"}),e.jsx("option",{value:"created_at",children:"Más Recientes"})]})]}),e.jsx("div",{className:"filter-group col-span-full",children:e.jsx("button",{onClick:a,className:"w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300",children:"Restablecer Filtros"})})]})]})}function R({images:s,alt:h,srcSet:v,loading:m="lazy",className:b="",imageRefs:o}){const c=w.useMemo(()=>!s||s.length===0?["https://via.placeholder.com/400x400?text=No+Image"]:s,[s]),[j,u]=f.useState(0),[x,g]=f.useState([]),p=f.useRef([]);f.useEffect(()=>{u(0)},[c]),f.useEffect(()=>{c.forEach(r=>{const a=new Image;a.src=typeof r=="string"?r:r.src})},[c]);const y=r=>{g(a=>[...a,r])},P=r=>{u(r)},N=()=>{u(r=>r===0?c.length-1:r-1)},n=()=>{u(r=>(r+1)%c.length)};return f.useEffect(()=>{o&&o(p.current)},[c,o]),e.jsxs("div",{className:`${b} relative w-full h-full overflow-hidden`,onClick:r=>r.stopPropagation(),children:[c.length>1&&e.jsx("button",{onClick:N,className:"absolute left-0 top-1/2 transform -translate-y-1/2 z-20 w-16 h-16 flex items-center justify-center",children:e.jsx("div",{className:"bg-orange-500/70 hover:bg-orange-600/80 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-300",children:e.jsx("span",{className:"text-white text-3xl font-bold transform -translate-x-0.5",children:"‹"})})}),c.length>1&&e.jsx("button",{onClick:n,className:"absolute right-0 top-1/2 transform -translate-y-1/2 z-20 w-16 h-16 flex items-center justify-center",children:e.jsx("div",{className:"bg-orange-500/70 hover:bg-orange-600/80 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-300",children:e.jsx("span",{className:"text-white text-3xl font-bold transform translate-x-0.5",children:"›"})})}),e.jsx("div",{className:"absolute inset-0 grid grid-cols-1 grid-rows-1",children:c.map((r,a)=>{const t=typeof r=="string"?r:r.src,i=a===j,l=x.includes(a);return e.jsx("div",{className:`
                absolute inset-0 transition-opacity duration-300
                ${i?"opacity-100 pointer-events-auto":"opacity-0 pointer-events-none"}
              `,children:e.jsx("img",{ref:d=>p.current[a]=d,src:l?"https://via.placeholder.com/400x400?text=Image+Error":t,alt:`${h} - imagen ${a+1}`,srcSet:typeof r=="object"?r.srcSet:void 0,loading:m,onError:()=>y(a),className:"w-full h-full object-cover absolute inset-0 transform scale-100"})},`${t}-${a}`)})}),c.length>1&&e.jsx("div",{className:"absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2",children:c.map((r,a)=>e.jsx("button",{onClick:()=>P(a),className:`
                w-2 h-2 rounded-full transition-colors duration-300
                ${a===j?"bg-orange-500":"bg-gray-300"}
              `},a))})]})}function W(s){return(Array.isArray(s)?s:[s]).filter(m=>m&&m.trim()!=="").map(m=>{try{return[{descriptor:"320w",width:320},{descriptor:"640w",width:640},{descriptor:"1024w",width:1024},{descriptor:"1920w",width:1920}].map(o=>`${m} ${o.descriptor}`).join(", ")}catch(b){return console.error("Error generating WebP srcset:",b),m}})}function O({product:s,className:h}){const{addItem:v}=L(),m=w.useMemo(()=>{if(!s.images||s.images.length===0)return["https://via.placeholder.com/400x400?text=No+Image"];const u=s.images.filter(x=>x&&x.trim()!=="");return u.length>0?u:["https://via.placeholder.com/400x400?text=No+Image"]},[s.images]),b=w.useMemo(()=>W(m),[m]),[o,c]=w.useState(!1),j=w.useRef([]);return w.useEffect(()=>{c(!1);const u=()=>{j.current.every(p=>p&&p.complete)&&c(!0)};u();const x=j.current.map((g,p)=>{if(g&&!g.complete){const y=()=>u();return g.addEventListener("load",y),{img:g,listener:y}}return null}).filter(Boolean);return()=>{x.forEach(g=>{g&&g.img.removeEventListener("load",g.listener)})}},[m]),e.jsxs("div",{className:[h,"product-card border rounded-lg overflow-hidden shadow-md flex flex-col h-full relative no-transform"].filter(Boolean).join(" "),children:[e.jsx("div",{className:"w-full aspect-square overflow-hidden",children:e.jsx("div",{className:"w-full h-full",children:e.jsx(R,{images:m,alt:s.name,srcSet:b.join(", "),loading:"lazy",className:"w-full h-full",imageRefs:u=>{j.current=u}})})}),e.jsxs("div",{className:"bg-white/90 py-3 px-4 flex-grow flex flex-col justify-between border-t border-gray-200",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-lg font-bold text-gray-900 mb-1",children:s.name}),e.jsxs("div",{className:"flex gap-1 text-xs text-orange-500 mb-1",children:[s.category_ref&&e.jsx("span",{children:s.category_ref.name}),s.anime&&e.jsxs("span",{children:["• ",s.anime.name]})]}),e.jsxs("span",{className:"text-lg font-bold text-orange-500 block mb-1",children:["C$",s.price.toFixed(2)]}),e.jsx("p",{className:"text-xs text-gray-600 mb-2 line-clamp-2",children:s.description})]}),e.jsxs("button",{onClick:()=>v(s),className:"w-full bg-black text-white py-2 px-2 rounded-md flex items-center justify-center gap-1","aria-label":`Agregar ${s.name} al carrito`,children:[e.jsx(M,{size:16}),"Agregar"]})]})]})}function z({error:s,resetErrorBoundary:h}){return f.useEffect(()=>{console.error("StoreFront Component Error:",s)},[s]),e.jsxs("div",{role:"alert",className:"p-4 text-center bg-red-100",children:[e.jsx("h2",{className:"text-xl font-bold text-red-600",children:"Error Loading Store Front"}),e.jsx("p",{className:"text-red-500",children:s.message}),e.jsx("button",{onClick:h,className:"mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",children:"Try Again"})]})}function G(){return e.jsx(_,{FallbackComponent:z,onReset:()=>{window.history.go(0)},children:e.jsx("main",{className:"store-front",children:e.jsx(V,{})})})}function V(){var N;const[s,h]=f.useState(()=>({search:"",category:"",anime:"",sortBy:"name_asc",minPrice:void 0,maxPrice:void 0,page:1}));f.useEffect(()=>{const n=()=>{h({search:"",category:"",anime:"",sortBy:"name_asc",minPrice:void 0,maxPrice:void 0,page:1})};return window.addEventListener("reset-store-filters",n),()=>{window.removeEventListener("reset-store-filters",n)}},[]);const v=f.useCallback(async()=>{var i,l;const[n,r]=await Promise.all([F.from("categories").select(`
          id, 
          name, 
          products:products(id)
        `),F.from("anime").select(`
          id, 
          name, 
          products:products(id)
        `)]),a=((i=n.data)==null?void 0:i.filter(d=>d.products.length>0).map(d=>({id:d.id,name:d.name})))||[],t=((l=r.data)==null?void 0:l.filter(d=>d.products.length>0).map(d=>({id:d.id,name:d.name})))||[];return{categoriesWithProducts:a,animesWithProducts:t}},[]),m=async n=>{try{const r=n.trim().toLowerCase(),a=[];a.push(`name.ilike.%${r}%`),a.push(`description.ilike.%${r}%`),a.push(`category.ilike.%${r}%`);const{data:t}=await F.from("anime").select("id").ilike("name",`%${r}%`).limit(1);return t&&t.length>0&&a.push(`anime_id.eq.${t[0].id}`),a.length>0?a.join(","):""}catch(r){return console.error("Error en búsqueda flexible:",r),""}},b=f.useCallback(async({pageParam:n=1})=>{try{const a=window.innerWidth<768?6:12,t=(n-1)*a,i=t+a-1;let l=F.from("products").select("*, categories(id, name), anime(id, name)",{count:"exact"});if(s.search&&s.search.trim()!==""){const I=s.search.toLowerCase().trim();try{const C=await m(I);C&&(l=l.or(C))}catch(C){console.error("Error en búsqueda de productos:",C)}}s.category&&s.category.trim()!==""&&(l=l.eq("category_id",s.category)),s.anime&&s.anime.trim()!==""&&(l=l.eq("anime_id",s.anime)),s.minPrice!==void 0&&(l=l.gte("price",s.minPrice)),s.maxPrice!==void 0&&(l=l.lte("price",s.maxPrice)),l=l.order(s.sortBy.split("_")[0],{ascending:s.sortBy.endsWith("_asc")});const{data:d,error:k,count:E}=await l.range(t,i);if(k)throw k;const S=E?Math.ceil(E/a):0;return{products:d||[],totalPages:S}}catch(r){return console.error("🚨 Error en búsqueda de productos:",r),{products:[],totalPages:0}}},[s]),{data:o,isLoading:c,error:j,isError:u,refetch:x}=$({queryKey:["products",s],queryFn:async()=>{const{categoriesWithProducts:n,animesWithProducts:r}=await v(),a=await b({pageParam:s.page||1});return{categoriesWithProducts:n,animesWithProducts:r,...a}},placeholderData:n=>n,staleTime:5e3,gcTime:1e4,refetchOnWindowFocus:!1,refetchOnMount:!1,refetchOnReconnect:!1}),g=f.useCallback(n=>{h(r=>({...r,...n}))},[]),p=n=>{h(r=>({...r,page:n}))},y=()=>{h({search:"",category:"",anime:"",sortBy:"name_asc",minPrice:void 0,maxPrice:void 0,page:1})},P=()=>{const n=(o==null?void 0:o.totalPages)||0,r=s.page||1;if(n<=1)return null;const t=r<=3?Array.from({length:Math.min(5,n)},(l,d)=>d+1):r>=n-2?Array.from({length:5},(l,d)=>n-5+d+1):[r-2,r-1,r,r+1,r+2];return e.jsx("div",{className:"fixed bottom-0 left-0 right-0 flex justify-center items-center p-4 z-50",children:e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx("button",{onClick:()=>p(r-1),disabled:r===1,className:"px-3 py-2 rounded-md disabled:opacity-50 transition-colors",children:"←"}),t.map(i=>e.jsx("button",{onClick:()=>p(i),className:`px-4 py-2 rounded-md transition-all duration-150 ease-in-out ${r===i?"bg-blue-500 text-white transform scale-110":"bg-gray-200 hover:bg-blue-100"} ${i<1||i>n?"hidden":""}`,children:i},i)),e.jsx("button",{onClick:()=>p(r+1),disabled:r===n,className:"px-3 py-2 rounded-md disabled:opacity-50 transition-colors",children:"→"})]})})};return e.jsx("div",{className:"relative min-h-screen bg-white overflow-hidden",children:e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10",children:[e.jsx(B,{title:"GATOTAKU - Tu Tienda de Anime",description:"Descubre nuestra colección de productos de anime. Figuras, mangas, accesorios y más."}),e.jsx("div",{className:"mb-8 bg-gray-50 rounded-lg shadow-md p-6",children:c?e.jsx("h1",{className:"text-3xl font-bold text-gray-800 border-b-2 border-orange-200 pb-2",children:"GATOTAKU"}):e.jsx(T,{onFilterChange:g,currentFilters:s,categories:(o==null?void 0:o.categoriesWithProducts)||[],animes:(o==null?void 0:o.animesWithProducts)||[],onResetFilters:y})}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 transition-all duration-300 ease-in-out transform",children:(N=o==null?void 0:o.products)==null?void 0:N.map((n,r)=>e.jsx("div",{className:"transition-all duration-300",style:{transitionDelay:`${r*50}ms`,willChange:"transform, opacity"},children:e.jsx(O,{product:n})},n.id))}),P()]})})}export{G as default};
