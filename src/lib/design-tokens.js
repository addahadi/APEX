export const P = {
  main:"#104ED8", mainL:"#EFF4FF", mainM:"#DBEAFE", mainD:"#0D3FAE",
  success:"#059669", successL:"#ECFDF5", successM:"#A7F3D0",
  warn:"#F59E0B", warnL:"#FFFBEB", warnM:"#FDE68A",
  error:"#E11D48", errorL:"#FFF1F2", errorM:"#FECDD3",
  bg:"#F8FAFC", surface:"#FFFFFF", border:"#E2E8F0", borderL:"#F1F5F9",
  txt:"#0F172A", txt2:"#475569", txt3:"#94A3B8", txt4:"#CBD5E1",
  purple:"#7C3AED", purpleL:"#F5F3FF",
  pink:"#BE185D", pinkL:"#FDF2F8",
  cyan:"#0891B2", cyanL:"#ECFEFF",
  orange:"#EA580C", orangeL:"#FFF7ED",
  h1:{size:36,weight:700}, h2:{size:30,weight:600}, h3:{size:24,weight:600},
  bodyLg:{size:18,weight:400}, body:{size:16,weight:400},
  sm:{size:14,weight:400}, xs:{size:12,weight:400},
};

export const STATUS_CONF = {
  active:    { color:P.success, bg:P.successL, label:"Active"    },
  banned:    { color:P.error,   bg:P.errorL,   label:"Banned"    },
  suspended: { color:P.warn,    bg:P.warnL,    label:"Suspended" },
};
export const SUB_CONF     = { ACTIVE:{ color:P.success, bg:P.successL }, INACTIVE:{ color:P.txt3, bg:P.borderL } };
export const PLAN_CONF    = { Free:{ color:P.txt2, bg:"#F1F5F9" }, Pro:{ color:P.main, bg:P.mainL }, Enterprise:{ color:P.purple, bg:P.purpleL } };
export const TYPE_CONF    = { NORMAL:{ color:P.cyan, bg:P.cyanL }, COMPANY:{ color:P.purple, bg:P.purpleL } };
export const ART_TYPE_CONF   = { BLOG:{ color:P.main, bg:P.mainL }, ACTUALITE:{ color:P.warn, bg:P.warnL } };
export const ART_STATUS_CONF = { PUBLISHED:{ color:P.success, bg:P.successL }, DRAFT:{ color:P.txt3, bg:P.borderL } };
export const FORMULA_TYPE_CONF = { MATERIAL:{ color:P.orange, bg:P.orangeL }, NON_MATERIAL:{ color:P.purple, bg:P.purpleL } };
export const CAT_LEVEL_CONF  = { MAIN:{ color:P.main, bg:P.mainL }, SUB:{ color:P.warn, bg:P.warnL }, ITEM:{ color:P.success, bg:P.successL } };
export const AI_TYPE_CONF    = { QUERY:{ color:P.main, bg:P.mainL }, RECOMMENDATION:{ color:P.purple, bg:P.purpleL }, ANALYSIS:{ color:P.cyan, bg:P.cyanL } };

export const uid = () => Math.random().toString(36).slice(2,8);
export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

export function mFindNode(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) { const f = mFindNode(n.children, id); if (f) return f; }
  }
  return null;
}
export function mGetCrumb(nodes, id, path = []) {
  for (const n of nodes) {
    const p = [...path, n];
    if (n.id === id) return p;
    if (n.children?.length) { const f = mGetCrumb(n.children, id, p); if (f) return f; }
  }
  return null;
}
export function mDeleteNode(nodes, id) {
  return nodes.filter(n => n.id !== id).map(n => ({ ...n, children: mDeleteNode(n.children || [], id) }));
}
export function mUpdateNode(nodes, id, patch) {
  return nodes.map(n => {
    if (n.id === id) return { ...n, ...patch };
    if (n.children?.length) return { ...n, children: mUpdateNode(n.children, id, patch) };
    return n;
  });
}
export function mCountDesc(node) {
  if (!node.children?.length) return 0;
  return node.children.length + node.children.reduce((a, c) => a + mCountDesc(c), 0);
}
export function mAllNodes(nodes) {
  const o = [];
  for (const n of nodes) { o.push(n); if (n.children?.length) o.push(...mAllNodes(n.children)); }
  return o;
}
