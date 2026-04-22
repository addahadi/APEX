import { useState } from "react";
import { Plus, Pencil, Trash2, Save, CheckCircle, RefreshCw, AlertCircle, Activity, Search } from "lucide-react";
import { P, AI_TYPE_CONF, uid } from "@/lib/design-tokens";
import { INIT_FINANCIAL, INIT_EXCHANGE_RATES, INIT_QUESTIONS, AI_USAGE } from "@/mock/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [tab, setTab]             = useState("financial");
  const [financial, setFinancial] = useState(INIT_FINANCIAL);
  const [rates]                   = useState(INIT_EXCHANGE_RATES);
  const [questions, setQuestions] = useState(INIT_QUESTIONS);
  const [aiUsage]                 = useState(AI_USAGE);
  const [editQ, setEditQ]         = useState(null);
  const [showNewQ, setShowNewQ]   = useState(false);
  const [newQ, setNewQ]           = useState({ question_text_en:"", question_text_ar:"", answer_text_en:"", answer_text_ar:"", display_location:"" });
  const [saved, setSaved]         = useState(false);

  const saveFinancial = () => { setSaved(true); setTimeout(()=>setSaved(false),2000); };

  const aiByType = ["QUERY","RECOMMENDATION","ANALYSIS"].map(t=>({ type:t, count:aiUsage.filter(a=>a.usage_type===t).length }));
  const aiByDate = [...new Set(aiUsage.map(a=>a.usage_date))].sort().reverse().map(d=>({ date:d, count:aiUsage.filter(a=>a.usage_date===d).length }));

  return (
    <div className="p-8 flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Financial config, exchange rates, Q&A, and AI usage history</p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 h-auto flex-wrap">
          <TabsTrigger value="financial" className="px-4 py-2">Financial Settings</TabsTrigger>
          <TabsTrigger value="exchange" className="px-4 py-2">Exchange Rates</TabsTrigger>
          <TabsTrigger value="questions" className="px-4 py-2">{`Predefined Q&A (${questions.length})`}</TabsTrigger>
          <TabsTrigger value="ai" className="px-4 py-2">AI Usage History</TabsTrigger>
        </TabsList>

        {/* ── FINANCIAL SETTINGS ── */}
        <TabsContent value="financial" className="max-w-xl">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg">Market Factor</CardTitle>
              <CardDescription>
                Applied on top of the official exchange rate to compute the final applied rate.
                <code className="block mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded text-blue-600 dark:text-blue-400 font-mono text-xs">
                  final_applied_rate = official_rate × market_factor
                </code>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="market-factor">Market Factor</Label>
                  <Input 
                    id="market-factor"
                    type="number" 
                    step="0.01"
                    value={String(financial.market_factor)} 
                    onChange={v => setFinancial(f => ({ ...f, market_factor: parseFloat(v.target.value) || 1.0 }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Updated</Label>
                  <div className="h-10 flex items-center px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-slate-500">
                    {financial.updated_at}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Live Preview</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  If official rate = <strong className="text-slate-900 dark:text-white">135.50 DZD/USD</strong>, then:<br/>
                  Final applied rate = 135.50 × {financial.market_factor} = <strong className="text-blue-600 dark:text-blue-400">{(135.50 * financial.market_factor).toFixed(2)} DZD/USD</strong>
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Button onClick={saveFinancial} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
                {saved && (
                  <span className="text-sm text-emerald-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                    <CheckCircle className="w-4 h-4" />
                    Changes saved!
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── EXCHANGE RATES ── */}
        <TabsContent value="exchange">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Rates are automatically synchronized daily. Market factor: <strong className="text-blue-600 font-bold">×{financial.market_factor}</strong>
              </p>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                Sync Now
              </Button>
            </div>
            
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Official Rate (DZD)</TableHead>
                    <TableHead>Final Applied Rate</TableHead>
                    <TableHead>API Status</TableHead>
                    <TableHead>Config</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates.map((r, i) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.last_sync_at}
                        {i === 0 && <Badge variant="secondary" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30">Latest</Badge>}
                      </TableCell>
                      <TableCell className="font-mono text-slate-500">{r.official_rate.toFixed(2)}</TableCell>
                      <TableCell className="font-mono font-bold text-blue-600 dark:text-blue-400">{r.final_applied_rate.toFixed(2)}</TableCell>
                      <TableCell>
                        {r.api_status ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-900/20">Online</Badge>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-600">
                            <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 dark:bg-rose-900/10 dark:border-rose-900/20">Offline</Badge>
                            <AlertCircle className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-400 italic">×{financial.market_factor}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        {/* ── PREDEFINED Q&A ── */}
        <TabsContent value="questions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Question & Answer Database</h3>
            {!showNewQ && (
              <Button onClick={() => setShowNewQ(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Question
              </Button>
            )}
          </div>

          {showNewQ && (
            <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10 animate-in fade-in zoom-in-95 duration-200">
              <CardHeader>
                <CardTitle className="text-md">{editQ ? "Edit Question" : "Create New Predefined Q&A"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Question (English)</Label>
                    <Input value={newQ.question_text_en} onChange={e => setNewQ(q => ({ ...q, question_text_en: e.target.value }))} placeholder="How do I..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Question (Arabic)</Label>
                    <Input className="text-right" dir="rtl" value={newQ.question_text_ar} onChange={e => setNewQ(q => ({ ...q, question_text_ar: e.target.value }))} placeholder="كيف أقوم بـ..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Answer (English)</Label>
                    <Textarea rows={3} value={newQ.answer_text_en} onChange={e => setNewQ(q => ({ ...q, answer_text_en: e.target.value }))} placeholder="Detailed answer content..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Answer (Arabic)</Label>
                    <Textarea className="text-right" dir="rtl" rows={3} value={newQ.answer_text_ar} onChange={e => setNewQ(q => ({ ...q, answer_text_ar: e.target.value }))} placeholder="محتوى الإجابة المفصلة..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Display Location</Label>
                  <Input value={newQ.display_location} onChange={e => setNewQ(q => ({ ...q, display_location: e.target.value }))} placeholder="calculator, materials, estimation..." />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => {
                    if (editQ) { setQuestions(qs => qs.map(q => q.id === editQ ? { ...q, ...newQ } : q)); }
                    else { setQuestions(qs => [...qs, { ...newQ, id: uid() }]); }
                    setShowNewQ(false); setEditQ(null); setNewQ({ question_text_en: "", question_text_ar: "", answer_text_en: "", answer_text_ar: "", display_location: "" });
                  }}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Question
                  </Button>
                  <Button variant="ghost" onClick={() => { setShowNewQ(false); setEditQ(null); }}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {questions.map(q => (
              <Card key={q.id} className="group hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-200">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{q.question_text_en}</h4>
                        <p className="text-sm text-slate-500 mt-1" dir="rtl">{q.question_text_ar}</p>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        {q.answer_text_en}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-400">{q.display_location}</Badge>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditQ(q.id); setNewQ({ ...q }); setShowNewQ(true); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => setQuestions(qs => qs.filter(x => x.id !== q.id))}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── AI USAGE HISTORY ── */}
        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiByType.map(({ type: t, count }) => {
              const c = AI_TYPE_CONF[t];
              return (
                <Card key={t} className="border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t}</p>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white">{count}</h3>
                    </div>
                    <div className={cn("p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600")}>
                      <Activity className="w-6 h-6" style={{ color: c.color.startsWith('P.') ? P[c.color.split('.')[1]] : c.color }} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aiUsage.map(a => {
                    const c = AI_TYPE_CONF[a.usage_type];
                    const color = c.color.startsWith('P.') ? P[c.color.split('.')[1]] : c.color;
                    const bg = c.bg.startsWith('P.') ? P[c.bg.split('.')[1]] : c.bg;
                    
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-semibold">{a.user}</TableCell>
                        <TableCell>
                          <Badge variant="outline" style={{ color, borderColor: color, backgroundColor: bg }}>
                            {a.usage_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">{a.usage_date}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Usage by Date</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {aiByDate.map(({ date, count }) => (
                  <div key={date} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{date}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                        style={{ width: `${(count / 10) * 100}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
