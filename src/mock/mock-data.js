import { P } from "../lib/design-tokens";

export const USERS = [
  { id:"u1", name:"Karim Benali",   email:"karim@mail.com",   status:"active",    plan:"Pro",        planType:"NORMAL",  subStatus:"ACTIVE",   joined:"2025-11-03", endDate:"2026-11-03", avatar:"KB" },
  { id:"u2", name:"Sara Meziani",   email:"sara@corp.dz",     status:"active",    plan:"Enterprise", planType:"COMPANY", subStatus:"ACTIVE",   joined:"2025-09-14", endDate:"2026-09-14", avatar:"SM" },
  { id:"u3", name:"Amine Touati",   email:"amine@mail.com",   status:"banned",    plan:"Free",       planType:"NORMAL",  subStatus:"INACTIVE", joined:"2026-01-22", endDate:"—",          avatar:"AT" },
  { id:"u4", name:"Lina Hadjadj",   email:"lina@archi.dz",   status:"active",    plan:"Pro",        planType:"NORMAL",  subStatus:"ACTIVE",   joined:"2025-12-01", endDate:"2026-12-01", avatar:"LH" },
  { id:"u5", name:"Yacine Oussad",  email:"yacine@build.com", status:"active",   plan:"Enterprise", planType:"COMPANY", subStatus:"ACTIVE",   joined:"2025-08-07", endDate:"2026-08-07", avatar:"YO" },
  { id:"u6", name:"Nadia Belkadi",  email:"nadia@mail.com",   status:"active",    plan:"Free",       planType:"NORMAL",  subStatus:"INACTIVE", joined:"2026-02-11", endDate:"—",          avatar:"NB" },
  { id:"u7", name:"Omar Rezig",     email:"omar@construct.dz",status:"suspended", plan:"Pro",        planType:"NORMAL",  subStatus:"ACTIVE",   joined:"2025-10-30", endDate:"2026-10-30", avatar:"OR" },
  { id:"u8", name:"Amira Chikh",    email:"amira@mail.com",   status:"active",    plan:"Free",       planType:"NORMAL",  subStatus:"INACTIVE", joined:"2026-03-01", endDate:"—",          avatar:"AC" },
];

export const PLAN_TYPES = [
  { id:"pt1", name_en:"Normal", name_ar:"عادي" },
  { id:"pt2", name_en:"Company", name_ar:"شركة" },
];
export const PLANS = [
  { id:"p1", name:"Free",       type:"NORMAL",  typeId:"pt1", desc:"Basic access for individuals",     price:0,    duration:365, features:[{key:"max_projects",val:"3"},{key:"max_calculations",val:"20"},{key:"can_export_pdf",val:"false"},{key:"support_level",val:"none"}] },
  { id:"p2", name:"Pro",        type:"NORMAL",  typeId:"pt1", desc:"Full access for professionals",    price:1900, duration:365, features:[{key:"max_projects",val:"20"},{key:"max_calculations",val:"500"},{key:"can_export_pdf",val:"true"},{key:"can_use_api",val:"false"},{key:"support_level",val:"email"}] },
  { id:"p3", name:"Enterprise", type:"COMPANY", typeId:"pt2", desc:"Unlimited for construction firms", price:5900, duration:365, features:[{key:"max_projects",val:"unlimited"},{key:"max_calculations",val:"unlimited"},{key:"can_export_pdf",val:"true"},{key:"can_use_api",val:"true"},{key:"support_level",val:"priority"},{key:"team_members",val:"25"}] },
];
export const SUBS = [
  { id:"s1", user:"Karim Benali",   email:"karim@mail.com",    plan:"Pro",        type:"NORMAL",  status:"ACTIVE",   start:"2025-11-03", end:"2026-11-03" },
  { id:"s2", user:"Sara Meziani",   email:"sara@corp.dz",      plan:"Enterprise", type:"COMPANY", status:"ACTIVE",   start:"2025-09-14", end:"2026-09-14" },
  { id:"s3", user:"Amine Touati",   email:"amine@mail.com",    plan:"Free",       type:"NORMAL",  status:"INACTIVE", start:"2026-01-22", end:"—" },
  { id:"s4", user:"Lina Hadjadj",   email:"lina@archi.dz",    plan:"Pro",        type:"NORMAL",  status:"ACTIVE",   start:"2025-12-01", end:"2026-12-01" },
  { id:"s5", user:"Yacine Oussad",  email:"yacine@build.com",  plan:"Enterprise", type:"COMPANY", status:"ACTIVE",   start:"2025-08-07", end:"2026-08-07" },
  { id:"s6", user:"Omar Rezig",     email:"omar@construct.dz", plan:"Pro",        type:"NORMAL",  status:"ACTIVE",   start:"2025-10-30", end:"2026-10-30" },
];

export const INIT_TAGS = [
  {id:"t1",name:"Béton armé"},{id:"t2",name:"Fondations"},{id:"t3",name:"Isolation"},
  {id:"t4",name:"Calcul de charge"},{id:"t5",name:"Maçonnerie"},{id:"t6",name:"Enduit"},
  {id:"t7",name:"Carrelage"},{id:"t8",name:"Actualité BTP"},
];
export const INIT_ARTICLES = [
  { id:"a1", title:"Tout savoir sur le béton armé C25",   slug:"beton-arme-c25",           excerpt:"Guide complet sur le dosage et l'utilisation du béton C25.",     type:"BLOG",      status:"PUBLISHED", tags:["t1","t2"], likes:142, saves:67 },
  { id:"a2", title:"Calcul des fondations isolées",        slug:"calcul-fondations-isolees", excerpt:"Méthode de calcul des semelles isolées selon les normes.",        type:"BLOG",      status:"PUBLISHED", tags:["t2","t4"], likes:98,  saves:44 },
  { id:"a3", title:"Nouveau règlement parasismique 2026", slug:"reglement-parasismique",    excerpt:"Les points clés du nouveau règlement parasismique 2026.",          type:"ACTUALITE", status:"PUBLISHED", tags:["t8"],      likes:211, saves:103 },
  { id:"a4", title:"Isolation thermique des murs",         slug:"isolation-thermique-murs",  excerpt:"Comparatif des matériaux isolants pour les murs extérieurs.",     type:"BLOG",      status:"DRAFT",     tags:["t3","t5"], likes:0,   saves:0 },
  { id:"a5", title:"Mise à jour des prix matériaux BTP",  slug:"prix-materiaux-btp-2026",   excerpt:"Tableau des prix actualisés des matériaux de construction 2026.", type:"ACTUALITE", status:"PUBLISHED", tags:["t8"],      likes:334, saves:189 },
];

export const INIT_UNITS = [
  { id:"un1", name_en:"Meter",        name_ar:"متر",          symbol:"m"   },
  { id:"un2", name_en:"Square Meter", name_ar:"متر مربع",     symbol:"m²"  },
  { id:"un3", name_en:"Cubic Meter",  name_ar:"متر مكعب",     symbol:"m³"  },
  { id:"un4", name_en:"Kilogram",     name_ar:"كيلوغرام",     symbol:"kg"  },
  { id:"un5", name_en:"Piece",        name_ar:"قطعة",          symbol:"pcs" },
  { id:"un6", name_en:"Liter",        name_ar:"لتر",           symbol:"L"   },
  { id:"un7", name_en:"Hour",         name_ar:"ساعة",          symbol:"hr"  },
];

export const INIT_RESOURCES = [
  { id:"r1", material_name_en:"Portland Cement 42.5", material_name_ar:"أسمنت بورتلاند 42.5", category:"Foundations", unit_id:"un4", min_price_usd:0.012, max_price_usd:0.015, unit_price_usd:0.0135, default_waste_factor:0.05 },
  { id:"r2", material_name_en:"Steel Rebar Ø12",      material_name_ar:"حديد تسليح Ø12",       category:"Columns",     unit_id:"un4", min_price_usd:0.085, max_price_usd:0.095, unit_price_usd:0.09,   default_waste_factor:0.03 },
  { id:"r3", material_name_en:"Fine Sand",             material_name_ar:"رمل ناعم",             category:"Grand Travaux",unit_id:"un3", min_price_usd:18,    max_price_usd:22,    unit_price_usd:20,     default_waste_factor:0.10 },
  { id:"r4", material_name_en:"Floor Tiles 60×60",    material_name_ar:"بلاط أرضية 60×60",    category:"Finition",    unit_id:"un2", min_price_usd:12,    max_price_usd:25,    unit_price_usd:18,     default_waste_factor:0.08 },
  { id:"r5", material_name_en:"Hollow Brick 20cm",    material_name_ar:"طوب أجوف 20سم",       category:"Grand Travaux",unit_id:"un5", min_price_usd:0.40,  max_price_usd:0.55,  unit_price_usd:0.48,   default_waste_factor:0.05 },
];

export const INIT_SERVICES = [
  { id:"sv1", service_name_en:"Excavation Works",    service_name_ar:"أعمال الحفر",        category:"Grand Travaux", unit_en:"m³", unit_ar:"م³", equipment_cost:4500, manpower_cost:2000, install_labor_price:0 },
  { id:"sv2", service_name_en:"Concrete Pouring",    service_name_ar:"صب الخرسانة",       category:"Foundations",   unit_en:"m³", unit_ar:"م³", equipment_cost:2000, manpower_cost:3500, install_labor_price:500 },
  { id:"sv3", service_name_en:"Tiling Installation", service_name_ar:"تركيب البلاط",      category:"Finition",      unit_en:"m²", unit_ar:"م²", equipment_cost:0,    manpower_cost:1800, install_labor_price:1200 },
  { id:"sv4", service_name_en:"Steel Fixing",        service_name_ar:"تركيب الحديد",      category:"Columns",       unit_en:"kg", unit_ar:"كغ", equipment_cost:500,  manpower_cost:2800, install_labor_price:300 },
];

export const INIT_FINANCIAL = { config_id:"cfg1", market_factor:1.15, updated_at:"2026-03-15" };
export const INIT_EXCHANGE_RATES = [
  { id:"er1", official_rate:135.50, final_applied_rate:155.82, api_status:true,  last_sync_at:"2026-04-09" },
  { id:"er2", official_rate:135.20, final_applied_rate:155.48, api_status:true,  last_sync_at:"2026-04-08" },
  { id:"er3", official_rate:134.90, final_applied_rate:155.14, api_status:false, last_sync_at:"2026-04-07" },
  { id:"er4", official_rate:135.00, final_applied_rate:155.25, api_status:true,  last_sync_at:"2026-04-06" },
];

export const INIT_QUESTIONS = [
  { id:"q1", question_text_en:"How do I calculate concrete volume?", question_text_ar:"كيف أحسب حجم الخرسانة؟", answer_text_en:"Multiply Length × Width × Height in meters to get volume in m³.", answer_text_ar:"اضرب الطول × العرض × الارتفاع بالأمتار للحصول على الحجم بـ م³.", display_location:"calculator" },
  { id:"q2", question_text_en:"What is the waste factor?",           question_text_ar:"ما هو معامل الهدر؟",       answer_text_en:"It accounts for material loss during construction, typically 5–10%.", answer_text_ar:"يأخذ بعين الاعتبار الفاقد في المواد أثناء البناء، وعادةً 5-10%.", display_location:"materials" },
  { id:"q3", question_text_en:"How is the exchange rate applied?",   question_text_ar:"كيف يُطبّق سعر الصرف؟",  answer_text_en:"The final rate = official rate × market factor configured by admin.", answer_text_ar:"السعر النهائي = السعر الرسمي × معامل السوق الذي يحدده المشرف.", display_location:"estimation" },
];

export const AI_USAGE = [
  { id:"ai1", user:"Karim Benali",   usage_type:"QUERY",          usage_date:"2026-04-09" },
  { id:"ai2", user:"Sara Meziani",   usage_type:"RECOMMENDATION", usage_date:"2026-04-09" },
  { id:"ai3", user:"Lina Hadjadj",   usage_type:"ANALYSIS",       usage_date:"2026-04-08" },
  { id:"ai4", user:"Yacine Oussad",  usage_type:"QUERY",          usage_date:"2026-04-08" },
  { id:"ai5", user:"Karim Benali",   usage_type:"ANALYSIS",       usage_date:"2026-04-07" },
  { id:"ai6", user:"Nadia Belkadi",  usage_type:"RECOMMENDATION", usage_date:"2026-04-07" },
  { id:"ai7", user:"Omar Rezig",     usage_type:"QUERY",          usage_date:"2026-04-06" },
];

export const INIT_TREE = [
  { id:"gt", name:"Grand Travaux", name_en:"Grand Travaux", name_ar:"أعمال كبرى", slug:"grand-travaux", category_level:"MAIN", icon:"🏚️", isActive:true, type:"sub_category", children:[
    { id:"gt-exc", name:"Excavation", name_en:"Excavation", name_ar:"الحفر", slug:"excavation", category_level:"SUB", icon:"⛏️", isActive:true, type:"leaf", children:[],
      fields:[{id:"f1",label:"Length",type:"NUMBER",unit:"m",required:true},{id:"f2",label:"Width",type:"NUMBER",unit:"m",required:true},{id:"f3",label:"Depth",type:"NUMBER",unit:"m",required:true}],
      formulas:[{id:"fo1",label:"Excavation Volume",expression:"L * W * D",outputUnit:"m³",formula_type:"NON_MATERIAL"},{id:"fo2",label:"Backfill Water",expression:"L * W * D * 0.1",outputUnit:"m³",formula_type:"NON_MATERIAL"}]
    },
    { id:"gt-found", name:"Foundations", name_en:"Foundations", name_ar:"الأساسات", slug:"foundations", category_level:"SUB", icon:"🏗️", isActive:true, type:"sub_category", children:[
      { id:"gt-iso", name:"Isolated Footing", name_en:"Isolated Footing", name_ar:"قاعدة معزولة", slug:"isolated-footing", category_level:"ITEM", icon:"🟦", isActive:true, type:"leaf", children:[],
        fields:[{id:"f4",label:"Length",type:"NUMBER",unit:"m",required:true},{id:"f5",label:"Width",type:"NUMBER",unit:"m",required:true},{id:"f6",label:"Thickness",type:"NUMBER",unit:"m",required:true}],
        formulas:[{id:"fo3",label:"Concrete Volume",expression:"L * W * H",outputUnit:"m³",formula_type:"MATERIAL"},{id:"fo4",label:"Surface Area",expression:"L * W",outputUnit:"m²",formula_type:"NON_MATERIAL"}]
      },
      { id:"gt-raft", name:"Raft Slab", name_en:"Raft Slab", name_ar:"بلاطة حصيرة", slug:"raft-slab", category_level:"ITEM", icon:"⬛", isActive:true, type:"leaf", children:[],
        fields:[{id:"f7",label:"Total Area",type:"NUMBER",unit:"m²",required:true},{id:"f8",label:"Thickness",type:"NUMBER",unit:"m",required:true}],
        formulas:[{id:"fo5",label:"Concrete Volume",expression:"S * H",outputUnit:"m³",formula_type:"MATERIAL"}]
      },
    ]},
    { id:"gt-col", name:"Columns", name_en:"Columns", name_ar:"الأعمدة", slug:"columns", category_level:"SUB", icon:"🏛️", isActive:true, type:"leaf", children:[],
      fields:[{id:"f9",label:"Width (b)",type:"NUMBER",unit:"m",required:true},{id:"f10",label:"Depth (d)",type:"NUMBER",unit:"m",required:true},{id:"f11",label:"Height",type:"NUMBER",unit:"m",required:true},{id:"f12",label:"Quantity",type:"NUMBER",unit:"pcs",required:true}],
      formulas:[{id:"fo6",label:"Total Volume",expression:"B * D * H * N",outputUnit:"m³",formula_type:"MATERIAL"},{id:"fo7",label:"Total Steel",expression:"B * D * H * N * 120",outputUnit:"kg",formula_type:"MATERIAL"}]
    },
  ]},
  { id:"fin", name:"Finition", name_en:"Finition", name_ar:"التشطيبات", slug:"finition", category_level:"MAIN", icon:"🎨", isActive:true, type:"sub_category", children:[
    { id:"fin-tile", name:"Tiling", name_en:"Tiling", name_ar:"البلاط", slug:"tiling", category_level:"SUB", icon:"🔲", isActive:true, type:"sub_category", children:[
      { id:"fin-straight", name:"Straight Tiling", name_en:"Straight Tiling", name_ar:"بلاط مستقيم", slug:"straight-tiling", category_level:"ITEM", icon:"⬛", isActive:true, type:"leaf", children:[],
        fields:[{id:"f13",label:"Room Length",type:"NUMBER",unit:"m",required:true},{id:"f14",label:"Room Width",type:"NUMBER",unit:"m",required:true},{id:"f15",label:"Tile Length",type:"NUMBER",unit:"m",required:true},{id:"f16",label:"Tile Width",type:"NUMBER",unit:"m",required:true}],
        formulas:[{id:"fo8",label:"Floor Area",expression:"L * W",outputUnit:"m²",formula_type:"NON_MATERIAL"},{id:"fo9",label:"Tile Count +5%",expression:"ceil((L*W)/(TL*TW)*1.05)",outputUnit:"pcs",formula_type:"MATERIAL"}]
      },
    ]},
  ]},
  { id:"pf", name:"Portes & Fenêtres", name_en:"Doors & Windows", name_ar:"الأبواب والنوافذ", slug:"doors-windows", category_level:"MAIN", icon:"🚪", isActive:true, type:"sub_category", children:[
    { id:"pf-door", name:"Rectangular Door", name_en:"Rectangular Door", name_ar:"باب مستطيل", slug:"rectangular-door", category_level:"ITEM", icon:"▬", isActive:true, type:"leaf", children:[],
      fields:[{id:"f17",label:"Height",type:"NUMBER",unit:"m",required:true},{id:"f18",label:"Width",type:"NUMBER",unit:"m",required:true},{id:"f19",label:"Quantity",type:"NUMBER",unit:"pcs",required:true}],
      formulas:[{id:"fo10",label:"Total Area",expression:"H * W * N",outputUnit:"m²",formula_type:"NON_MATERIAL"},{id:"fo11",label:"Manufacturing Time",expression:"2 + H * W * 1.5 * N",outputUnit:"hrs",formula_type:"NON_MATERIAL"}]
    },
  ]},
];

export const newUsersData = [{d:"Mar 1",v:3},{d:"Mar 3",v:5},{d:"Mar 5",v:2},{d:"Mar 7",v:8},{d:"Mar 9",v:6},{d:"Mar 11",v:11},{d:"Mar 13",v:7},{d:"Mar 15",v:14},{d:"Mar 17",v:9}];
export const revenueData  = [{m:"Oct",v:48000},{m:"Nov",v:62000},{m:"Dec",v:71000},{m:"Jan",v:55000},{m:"Feb",v:83000},{m:"Mar",v:91000}];
export const ACTIVITY = [
  { user:"Sara Meziani",  action:"Created project",   entity:"Villa Yasmine",    time:"2m ago",  color:P.main },
  { user:"Karim Benali",  action:"Calculated",        entity:"Isolated Footing", time:"8m ago",  color:P.warn },
  { user:"Yacine Oussad", action:"Upgraded to",       entity:"Enterprise",       time:"14m ago", color:P.success },
  { user:"Lina Hadjadj",  action:"Published article", entity:"Béton armé C25",   time:"31m ago", color:P.cyan },
  { user:"Nadia Belkadi", action:"Registered",        entity:"new account",      time:"1h ago",  color:P.purple },
  { user:"Amine Touati",  action:"Account banned",    entity:"by admin",         time:"2h ago",  color:P.error },
];
