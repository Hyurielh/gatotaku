import{r as m,j as e,k as y,S as C,E as k,D as N,G as w}from"./vendor-7917a80b.js";import{a as F,s as j,S as _}from"./index-d8fa6d30.js";import{I as S}from"./ImageCarousel-e32be9d1.js";function E(r){return(Array.isArray(r)?r:[r]).filter(i=>i&&i.trim()!=="").map(i=>{try{return[{descriptor:"320w",width:320},{descriptor:"640w",width:640},{descriptor:"1024w",width:1024},{descriptor:"1920w",width:1920}].map(n=>`${i} ${n.descriptor}`).join(", ")}catch(o){return console.error("Error generating WebP srcset:",o),i}})}function A({onFilterChange:r,currentFilters:c={},categories:l,animes:i}){const[o,n]=m.useState(c),d=a=>{const t={...o,...a};n(t),r(t)},u=a=>{d({search:a.target.value})},h=a=>{d({category:a.target.value===""?void 0:a.target.value})},x=a=>{d({anime:a.target.value===""?void 0:a.target.value})},g=a=>{const t=a.target.value?parseFloat(a.target.value):void 0;d({minPrice:t})},p=a=>{const t=a.target.value?parseFloat(a.target.value):void 0;d({maxPrice:t})},b=a=>{d({sortBy:a.target.value})},s=()=>{n({}),r({})};return e.jsxs("div",{className:"search-and-filters grid grid-cols-1 md:grid-cols-3 gap-4","aria-label":"Filtros de búsqueda",children:[e.jsxs("div",{className:"filter-group",children:[e.jsx("label",{htmlFor:"search-input",className:"block text-sm font-medium text-gray-700",children:"Buscar productos"}),e.jsx("input",{id:"search-input",type:"text",placeholder:"Buscar productos...",value:o.search||"",onChange:u,"aria-label":"Buscar productos por nombre o descripción",className:"mt-1 block w-full p-2 border border-gray-300 rounded-md"})]}),e.jsxs("div",{className:"filter-group",children:[e.jsx("label",{htmlFor:"category-select",className:"block text-sm font-medium text-gray-700",children:"Categoría"}),e.jsxs("select",{id:"category-select",value:o.category||"",onChange:h,"aria-label":"Seleccionar categoría de producto",className:"mt-1 block w-full p-2 border border-gray-300 rounded-md",children:[e.jsx("option",{value:"",children:"Todas las categorías"}),l.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("div",{className:"filter-group",children:[e.jsx("label",{htmlFor:"anime-select",className:"block text-sm font-medium text-gray-700",children:"Anime"}),e.jsxs("select",{id:"anime-select",value:o.anime||"",onChange:x,"aria-label":"Seleccionar anime",className:"mt-1 block w-full p-2 border border-gray-300 rounded-md",children:[e.jsx("option",{value:"",children:"Todos los Animes"}),i.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("div",{className:"filter-group",children:[e.jsx("label",{htmlFor:"min-price-input",className:"block text-sm font-medium text-gray-700",children:"Precio Mínimo"}),e.jsx("input",{id:"min-price-input",type:"number",placeholder:"Precio mínimo",value:o.minPrice||"",onChange:g,"aria-label":"Filtrar productos por precio mínimo",min:"0",step:"0.01",className:"mt-1 block w-full p-2 border border-gray-300 rounded-md"})]}),e.jsxs("div",{className:"filter-group",children:[e.jsx("label",{htmlFor:"max-price-input",className:"block text-sm font-medium text-gray-700",children:"Precio Máximo"}),e.jsx("input",{id:"max-price-input",type:"number",placeholder:"Precio máximo",value:o.maxPrice||"",onChange:p,"aria-label":"Filtrar productos por precio máximo",min:"0",step:"0.01",className:"mt-1 block w-full p-2 border border-gray-300 rounded-md"})]}),e.jsxs("div",{className:"filter-group",children:[e.jsx("label",{htmlFor:"sort-select",className:"block text-sm font-medium text-gray-700",children:"Ordenar por"}),e.jsxs("select",{id:"sort-select",value:o.sortBy||"name_asc",onChange:b,"aria-label":"Ordenar productos",className:"mt-1 block w-full p-2 border border-gray-300 rounded-md",children:[e.jsx("option",{value:"name_asc",children:"Nombre A-Z"}),e.jsx("option",{value:"name_desc",children:"Nombre Z-A"}),e.jsx("option",{value:"price_asc",children:"Precio: Menor a Mayor"}),e.jsx("option",{value:"price_desc",children:"Precio: Mayor a Menor"})]})]}),Object.keys(o).length>0&&e.jsx("div",{className:"col-span-full",children:e.jsx("button",{onClick:s,"aria-label":"Restablecer filtros",className:"w-full p-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors",children:"Restablecer Filtros"})})]})}function M({product:r}){const{addItem:c}=F(),l=y.useMemo(()=>{if(!r.images||r.images.length===0)return["https://via.placeholder.com/400x400?text=No+Image"];const o=r.images.filter(n=>n&&n.trim()!=="");return o.length>0?o:["https://via.placeholder.com/400x400?text=No+Image"]},[r.images]),i=y.useMemo(()=>E(l),[l]);return e.jsxs("div",{className:"product-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300",children:[e.jsx("div",{className:"w-full h-64 md:h-80",children:e.jsx(S,{images:l,alt:r.name,srcSet:i.join(", "),loading:"lazy"})}),e.jsx("div",{className:"p-6",children:e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-bold text-gray-900 mb-2",children:r.name}),e.jsxs("div",{className:"flex gap-2 text-sm text-orange-500 mb-2",children:[r.category_ref&&e.jsx("span",{children:r.category_ref.name}),r.anime&&e.jsxs("span",{children:["• ",r.anime.name]})]}),e.jsxs("span",{className:"text-xl font-bold text-orange-500 block mb-2",children:["C$",r.price.toFixed(2)]}),e.jsx("p",{className:"text-gray-600 mb-4",children:r.description}),e.jsxs("button",{onClick:()=>c(r),className:"w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-900 transition-colors flex items-center justify-center gap-2","aria-label":`Agregar ${r.name} al carrito`,children:[e.jsx(C,{size:20}),"Agregar al carrito"]})]})})]})}function I({error:r,resetErrorBoundary:c}){return m.useEffect(()=>{console.error("StoreFront Component Error:",r)},[r]),e.jsxs("div",{role:"alert",className:"p-4 text-center bg-red-100",children:[e.jsx("h2",{className:"text-xl font-bold text-red-600",children:"Error Loading Store Front"}),e.jsx("p",{className:"text-red-500",children:r.message}),e.jsx("button",{onClick:c,className:"mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",children:"Try Again"})]})}function G(){return e.jsx(k,{FallbackComponent:I,onReset:()=>{window.location.reload()},children:e.jsx(T,{})})}function T(){const[r,c]=m.useState(()=>({search:"",category:"",anime:"",sortBy:"name_asc",minPrice:0,maxPrice:1e4})),l=m.useCallback(async()=>{const{data:s}=await j.from("categories").select(`
        id, 
        name, 
        products:products(id)
      `);return(s==null?void 0:s.filter(a=>a.products.length>0).map(a=>({id:a.id,name:a.name})))||[]},[]),i=m.useCallback(async()=>{const{data:s}=await j.from("anime").select(`
        id, 
        name, 
        products:products(id)
      `);return(s==null?void 0:s.filter(a=>a.products.length>0).map(a=>({id:a.id,name:a.name})))||[]},[]),o=m.useCallback(async({pageParam:s=1})=>{try{let t=j.from("products").select(`
          *,
          category_ref:categories(id, name),
          anime:anime(id, name)
        `,{count:"exact"}).range((s-1)*5,s*5-1);switch(r.search&&(t=t.or(`
          ilike(name, "%${r.search}%"),
          ilike(description, "%${r.search}%"),
          ilike(category_ref.name, "%${r.search}%"),
          ilike(anime.name, "%${r.search}%")
        `)),r.category&&(t=t.eq("category_id",r.category)),r.anime&&(t=t.eq("anime_id",r.anime)),r.minPrice!==void 0&&(t=t.gte("price",r.minPrice)),r.maxPrice!==void 0&&(t=t.lte("price",r.maxPrice)),r.sortBy){case"name_asc":t=t.order("name",{ascending:!0});break;case"name_desc":t=t.order("name",{ascending:!1});break;case"price_asc":t=t.order("price",{ascending:!0});break;case"price_desc":t=t.order("price",{ascending:!1});break;default:t=t.order("created_at",{ascending:!1})}const{data:f,error:v,count:P}=await t;if(v)throw v;return{products:f||[],nextPage:f&&f.length===5?s+1:void 0,totalCount:P}}catch(a){throw console.error("Failed to fetch products:",a),a}},[r]),{data:n}=N("categoriesWithProducts",l),{data:d}=N("animesWithProducts",i),{data:u,fetchNextPage:h,hasNextPage:x,isFetchingNextPage:g}=w(["products",r],o,{getNextPageParam:s=>s.nextPage,keepPreviousData:!0}),p=m.useCallback(s=>{c(a=>({...a,...s}))},[]),b=m.useMemo(()=>(u==null?void 0:u.pages.flatMap(s=>s.products))||[],[u]);return e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6",children:[e.jsx(_,{title:"GATOTAKU - Tu Tienda de Anime",description:"Descubre nuestra colección de productos de anime. Figuras, mangas, accesorios y más."}),e.jsx(A,{categories:n||[],animes:d||[],currentFilters:r,onFilterChange:p}),e.jsx("div",{className:"mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",children:b.map(s=>e.jsx(M,{product:s},s.id))}),x&&e.jsx("button",{disabled:g,onClick:()=>h(),className:"bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded",children:g?"Cargando...":"Cargar más"})]})}export{G as default};
