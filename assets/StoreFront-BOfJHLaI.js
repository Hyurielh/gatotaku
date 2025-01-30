import{r as u,j as e,n as A,o as S,S as M,E as I,p as _}from"./vendor-CfrxxlCL.js";import{u as B,s as P,S as L,C as z}from"./index-DfJBPeZ2.js";function T({onFilterChange:r,currentFilters:g={},categories:j,animes:m,onResetFilters:h}){const[a,p]=u.useState(g),[b,N]=u.useState(!1),f=s=>{const d={...g,...s};p(d),r(d)},v=s=>{f({category:s.target.value===""?void 0:s.target.value})},y=s=>{f({anime:s.target.value===""?void 0:s.target.value})},w=s=>{const d=s.target.value?parseFloat(s.target.value):void 0;f({minPrice:d})},t=s=>{const d=s.target.value?parseFloat(s.target.value):void 0;f({maxPrice:d})},l=s=>{f({sortBy:s.target.value})},o=s=>{const d=s.target.value;p(c=>({...c,search:d===""?void 0:d})),r({search:d===""?void 0:d})},n=()=>{N(!b)},i=()=>{const s={search:void 0,category:void 0,anime:void 0,minPrice:void 0,maxPrice:void 0,sortBy:"name_asc"};p(s),r(s),h&&h()};return e.jsxs("div",{className:"search-and-filters-container",children:[e.jsxs("div",{className:"filter-group mb-4",children:[e.jsx("label",{htmlFor:"search-input-desktop",className:"block text-sm font-medium text-gray-700 mb-1",children:"Buscar productos"}),e.jsx("input",{id:"search-input-desktop",type:"text",placeholder:"Buscar productos...",value:a.search||"",onChange:o,"aria-label":"Buscar productos por nombre o descripción",className:"block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"})]}),e.jsx("div",{className:"md:hidden flex justify-end mb-4",children:e.jsxs("button",{onClick:n,className:"flex items-center px-4 py-2 bg-orange-500 text-white rounded-md",children:[e.jsx(A,{className:"mr-2"})," Filtros"]})}),e.jsxs("div",{className:`
        additional-filters
        grid grid-cols-1 
        ${b?"grid":"hidden"} 
        md:grid md:grid-cols-2 md:gap-4
      `,children:[e.jsxs("div",{className:"col-span-full mb-4",children:[e.jsx("label",{htmlFor:"search-input-mobile",className:"block text-sm font-medium text-gray-700 mb-1",children:"Buscar productos"}),e.jsx("input",{id:"search-input-mobile",type:"text",placeholder:"Buscar productos...",value:a.search||"",onChange:o,"aria-label":"Buscar productos por nombre o descripción",className:"block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"})]}),e.jsxs("div",{className:"md:flex md:space-x-4 md:col-span-2",children:[e.jsxs("div",{className:"filter-group flex-1",children:[e.jsx("label",{htmlFor:"category-select",className:"block text-sm font-medium text-gray-700 mb-1",children:"Categoría"}),e.jsxs("select",{id:"category-select",value:a.category||"",onChange:v,"aria-label":"Seleccionar categoría de producto",className:"block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500",children:[e.jsx("option",{value:"",children:"Todas las categorías"}),j.map(s=>e.jsx("option",{value:s.id,children:s.name},s.id))]})]}),e.jsxs("div",{className:"filter-group flex-1 ",children:[e.jsx("label",{htmlFor:"anime-select",className:"block text-sm font-medium text-gray-700 mb-1",children:"Anime"}),e.jsxs("select",{id:"anime-select",value:a.anime||"",onChange:y,"aria-label":"Seleccionar anime",className:"block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500",children:[e.jsx("option",{value:"",children:"Todos los Animes"}),m.map(s=>e.jsx("option",{value:s.id,children:s.name},s.id))]})]})]}),e.jsxs("div",{className:"md:flex md:space-x-4 md:col-span-2",children:[e.jsxs("div",{className:"filter-group flex-1",children:[e.jsx("label",{htmlFor:"min-price-input",className:"block text-sm font-medium text-gray-700 mb-1",children:"Precio Mínimo"}),e.jsx("input",{id:"min-price-input",type:"number",placeholder:"Precio mínimo",value:a.minPrice!==void 0?a.minPrice:"",onChange:w,"aria-label":"Filtrar productos por precio mínimo",min:"0",step:"0.01",className:"block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"})]}),e.jsxs("div",{className:"filter-group flex-1",children:[e.jsx("label",{htmlFor:"max-price-input",className:"block text-sm font-medium text-gray-700 mb-1",children:"Precio Máximo"}),e.jsx("input",{id:"max-price-input",type:"number",placeholder:"Precio máximo",value:a.maxPrice!==void 0?a.maxPrice:"",onChange:t,"aria-label":"Filtrar productos por precio máximo",min:"0",step:"0.01",className:"block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"})]})]}),e.jsxs("div",{className:"col-span-full",children:[e.jsx("label",{htmlFor:"sort-select",className:"block text-sm font-medium text-gray-700 mb-1",children:"Ordenar por"}),e.jsxs("select",{id:"sort-select",value:a.sortBy||"name_asc",onChange:l,"aria-label":"Ordenar productos",className:"block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500",children:[e.jsx("option",{value:"name_asc",children:"Nombre A-Z"}),e.jsx("option",{value:"name_desc",children:"Nombre Z-A"}),e.jsx("option",{value:"price_asc",children:"Precio: Menor a Mayor"}),e.jsx("option",{value:"price_desc",children:"Precio: Mayor a Menor"}),e.jsx("option",{value:"created_at",children:"Más Recientes"})]})]}),e.jsx("div",{className:"filter-group col-span-full",children:e.jsx("button",{onClick:i,className:"w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300",children:"Restablecer Filtros"})})]})]})}function W({images:r,alt:g,srcSet:j,loading:m="lazy",className:h}){const a=u.useMemo(()=>Array.isArray(r)&&r.length>0?r.map((t,l)=>typeof t=="string"?{src:t,srcSet:`${t} 320w, ${t} 640w, ${t} 1024w, ${t} 1920w`}:t.srcSet?t:{...t,srcSet:`${t.src} 320w, ${t.src} 640w, ${t.src} 1024w, ${t.src} 1920w`}):[{src:"https://via.placeholder.com/400x400?text=No+Image",srcSet:"https://via.placeholder.com/400x400?text=No+Image 320w"}],[r]),[p,b]=u.useState(0),[N,f]=u.useState([]);u.useEffect(()=>{b(0),f([])},[a]);const v=u.useCallback(()=>{b(t=>t===a.length-1?0:t+1)},[a]),y=u.useCallback(()=>{b(t=>t===0?a.length-1:t-1)},[a]),w=u.useCallback(t=>{f(l=>[...l,t])},[a]);return e.jsxs("div",{className:`${h} relative w-full h-full overflow-hidden`,onClick:t=>t.stopPropagation(),children:[e.jsx("div",{className:"absolute inset-0 grid grid-cols-1 grid-rows-1",children:a.map((t,l)=>{const o=l===p,n=N.includes(l);return e.jsx("div",{className:`
                absolute inset-0 transition-all duration-500 ease-in-out
                ${o?"opacity-100 z-10 visible":"opacity-0 z-0 invisible"}
                ${n?"hidden":""}
              `,children:e.jsx("img",{src:t.src,alt:`${g} - Image ${l+1}`,srcSet:t.srcSet,loading:m,onError:()=>w(l),className:"w-full h-full object-cover"},`img-${l}`)},`${t.src}-${l}`)})}),a.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:y,className:"absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-orange-500 transition-colors z-20","aria-label":"Previous Image",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15 19l-7-7 7-7"})})}),e.jsx("button",{onClick:v,className:"absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-orange-500 transition-colors z-20","aria-label":"Next Image",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5l7 7-7 7"})})})]}),a.length>1&&e.jsx("div",{className:"absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20",children:a.map((t,l)=>e.jsx("button",{onClick:()=>b(l),className:`
                w-2 h-2 rounded-full transition-colors duration-300
                ${l===p?"bg-orange-500":"bg-gray-300"}
              `,"aria-label":`Go to image ${l+1}`},`dot-${l}`))})]})}function O(r){return(Array.isArray(r)?r:[r]).filter(m=>m&&m.trim()!=="").map(m=>{try{return[{descriptor:"320w",width:320},{descriptor:"640w",width:640},{descriptor:"1024w",width:1024},{descriptor:"1920w",width:1920}].map(a=>`${m} ${a.descriptor}`).join(", ")}catch(h){return console.error("Error generating WebP srcset:",h),m}})}function R({product:r,className:g}){const{addItem:j}=B(),m=S.useMemo(()=>{if(!r.images||r.images.length===0)return["https://via.placeholder.com/400x400?text=No+Image"];const a=r.images.filter(p=>p&&p.trim()!=="");return a.length>0?a:["https://via.placeholder.com/400x400?text=No+Image"]},[r.images]),h=S.useMemo(()=>O(m),[m]);return e.jsxs("div",{className:[g,"product-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"].filter(Boolean).join(" "),children:[e.jsx("div",{className:"w-full aspect-square",children:e.jsx("div",{className:"w-full h-full object-cover",children:e.jsx(W,{images:m,alt:r.name,srcSet:h.join(", "),loading:"lazy"})})}),e.jsxs("div",{className:"bg-white/90 py-3 px-4 flex-grow flex flex-col justify-between border-t border-gray-200",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-lg font-bold text-gray-900 mb-1",children:r.name}),e.jsxs("div",{className:"flex gap-1 text-xs text-orange-500 mb-1",children:[r.category_ref&&e.jsx("span",{children:r.category_ref.name}),r.anime&&e.jsxs("span",{children:["• ",r.anime.name]})]}),e.jsxs("span",{className:"text-lg font-bold text-orange-500 block mb-1",children:["C$",r.price.toFixed(2)]}),e.jsx("p",{className:"text-xs text-gray-600 mb-2 line-clamp-2",children:r.description})]}),e.jsxs("button",{onClick:()=>j(r),className:"w-full bg-black text-white py-2 px-2 rounded-md hover:bg-gray-900 transition-colors flex items-center justify-center gap-1","aria-label":`Agregar ${r.name} al carrito`,children:[e.jsx(M,{size:16}),"Agregar"]})]})]})}function q({error:r,resetErrorBoundary:g}){return u.useEffect(()=>{console.error("StoreFront Component Error:",r)},[r]),e.jsxs("div",{role:"alert",className:"p-4 text-center bg-red-100",children:[e.jsx("h2",{className:"text-xl font-bold text-red-600",children:"Error Loading Store Front"}),e.jsx("p",{className:"text-red-500",children:r.message}),e.jsx("button",{onClick:g,className:"mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",children:"Try Again"})]})}function Z(){return e.jsx(I,{FallbackComponent:q,onReset:()=>{window.history.go(0)},children:e.jsx(G,{})})}function G(){var l;const[r,g]=u.useState(()=>({search:"",category:"",anime:"",sortBy:"name_asc",minPrice:void 0,maxPrice:void 0,page:1}));u.useEffect(()=>{const o=()=>{g({search:"",category:"",anime:"",sortBy:"name_asc",minPrice:void 0,maxPrice:void 0,page:1})};return window.addEventListener("reset-store-filters",o),()=>{window.removeEventListener("reset-store-filters",o)}},[]);const j=u.useCallback(async()=>{var d,c;const[o,n]=await Promise.all([P.from("categories").select(`
          id, 
          name, 
          products:products(id)
        `),P.from("anime").select(`
          id, 
          name, 
          products:products(id)
        `)]),i=((d=o.data)==null?void 0:d.filter(x=>x.products.length>0).map(x=>({id:x.id,name:x.name})))||[],s=((c=n.data)==null?void 0:c.filter(x=>x.products.length>0).map(x=>({id:x.id,name:x.name})))||[];return{categoriesWithProducts:i,animesWithProducts:s}},[]),m=async o=>{try{const n=o.trim().toLowerCase(),i=[];i.push(`name.ilike.%${n}%`),i.push(`description.ilike.%${n}%`),i.push(`category.ilike.%${n}%`);const{data:s}=await P.from("anime").select("id").ilike("name",`%${n}%`).limit(1);return s&&s.length>0&&i.push(`anime_id.eq.${s[0].id}`),i.length>0?i.join(","):""}catch(n){return console.error("Error en búsqueda flexible:",n),""}},h=u.useCallback(async({pageParam:o=1})=>{try{const i=window.innerWidth<768?6:12,s=(o-1)*i,d=s+i-1;let c=P.from("products").select("*, categories(id, name), anime(id, name)",{count:"exact"});if(r.search&&r.search.trim()!==""){const E=r.search.toLowerCase().trim();try{const k=await m(E);k&&(c=c.or(k))}catch(k){console.error("Error en búsqueda de productos:",k)}}r.category&&r.category.trim()!==""&&(c=c.eq("category_id",r.category)),r.anime&&r.anime.trim()!==""&&(c=c.eq("anime_id",r.anime)),r.minPrice!==void 0&&(c=c.gte("price",r.minPrice)),r.maxPrice!==void 0&&(c=c.lte("price",r.maxPrice)),c=c.order(r.sortBy.split("_")[0],{ascending:r.sortBy.endsWith("_asc")});const{data:x,error:C,count:F}=await c.range(s,d);if(C)throw C;const $=F?Math.ceil(F/i):0;return{products:x||[],totalPages:$}}catch(n){return console.error("🚨 Error en búsqueda de productos:",n),{products:[],totalPages:0}}},[r]),{data:a,isLoading:p,error:b,isError:N,refetch:f}=_({queryKey:["products",r],queryFn:async()=>{const{categoriesWithProducts:o,animesWithProducts:n}=await j(),i=await h({pageParam:r.page||1});return{categoriesWithProducts:o,animesWithProducts:n,...i}},placeholderData:o=>o,staleTime:5e3,gcTime:1e4,refetchOnWindowFocus:!1,refetchOnMount:!1,refetchOnReconnect:!1}),v=u.useCallback(o=>{g(n=>({...n,...o}))},[]),y=o=>{g(n=>({...n,page:o}))},w=()=>{g({search:"",category:"",anime:"",sortBy:"name_asc",minPrice:void 0,maxPrice:void 0,page:1})},t=()=>{const o=(a==null?void 0:a.totalPages)||0,n=r.page||1;return o<=1?null:e.jsx("div",{className:"flex justify-center mt-8 space-x-2",children:Array.from({length:o},(i,s)=>s+1).map(i=>e.jsx("button",{onClick:()=>y(i),className:`px-4 py-2 rounded-md ${n===i?"bg-blue-500 text-white":"bg-gray-200"}`,children:i},i))})};return e.jsxs("div",{className:"relative min-h-screen bg-white overflow-hidden",children:[e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10",children:[e.jsx(L,{title:"GATOTAKU - Tu Tienda de Anime",description:"Descubre nuestra colección de productos de anime. Figuras, mangas, accesorios y más."}),e.jsx("div",{className:"mb-8 bg-gray-50 rounded-lg shadow-md p-6",children:p?e.jsx("h1",{className:"text-3xl font-bold text-gray-800 border-b-2 border-orange-200 pb-2",children:"GATOTAKU"}):e.jsx(T,{onFilterChange:v,currentFilters:r,categories:(a==null?void 0:a.categoriesWithProducts)||[],animes:(a==null?void 0:a.animesWithProducts)||[],onResetFilters:w})}),e.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4",children:(l=a==null?void 0:a.products)==null?void 0:l.map(o=>e.jsx(R,{product:o},o.id))}),t()]}),e.jsx("div",{className:"fixed inset-0 pointer-events-none z-0",style:{background:`
            linear-gradient(to right, rgba(0,0,0,0.1) 0%, transparent 10%, transparent 90%, rgba(0,0,0,0.1) 100%), 
            url('https://rare-gallery.com/thumbnail/454083-manga-anime-monochrome-anime-girls-anime-boys-collage.jpg')`,backgroundSize:"cover, auto 100%",backgroundPosition:"center, center",backgroundRepeat:"no-repeat, no-repeat"}}),e.jsx(z,{})]})}export{Z as default};
