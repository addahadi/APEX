import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calculator, Save, SlidersHorizontal, Package, Loader2, Play, BarChart2 } from "lucide-react";
import { useCalculate, useSaveLeafResult } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLocalizedField } from "@/hooks/useLocalizedField";

const LeafCategory = ({ node }) => {
  const { t } = useTranslation("user");
  const { t: tc } = useTranslation("common");
  const localize = useLocalizedField();
  const { projectId, categoryId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedFormulaId, setSelectedFormulaId] = useState(null);
  const [selectedConfigId, setSelectedConfigId] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [calculationResult, setCalculationResult] = useState(null);

  const calculateMutation = useCalculate();
  const saveResultMutation = useSaveLeafResult();

  const formulas = node?.formulas || [];
  const configs = node?.configs || [];

  useEffect(() => {
    if (formulas.length > 0 && !formulas.find(f => f.formula_id === selectedFormulaId)) {
      setSelectedFormulaId(formulas[0].formula_id);
    }
    if (configs.length > 0 && !configs.find(c => c.config_id === selectedConfigId)) {
      setSelectedConfigId(configs[0].config_id);
    }
  }, [formulas, configs, selectedFormulaId, selectedConfigId]);

  const activeFormula = formulas.find(f => f.formula_id === selectedFormulaId) || formulas[0];
  const activeFormulaName = activeFormula ? (localize(activeFormula, "name") || activeFormula.name) : "";
  const fields = activeFormula?.fields || [];

  useEffect(() => {
    if (fields.length > 0) {
      const initialValues = {};
      fields.forEach(f => {
        const typeName = (f.field_type_name || 'number').toLowerCase();
        if (typeName.includes('bool')) {
          // BOOLEAN — default to 0 (false)
          initialValues[f.field_id] = 0;
        } else if (typeName.includes('select')) {
          // SELECT — default to the value of the first option
          try {
            const opts = JSON.parse(f.default_value || '[]');
            initialValues[f.field_id] = opts[0]?.value ?? 0;
          } catch {
            initialValues[f.field_id] = 0;
          }
        } else {
          // NUMBER — original behaviour
          const parsed = parseFloat(f.default_value);
          initialValues[f.field_id] = isNaN(parsed) ? 0 : parsed;
        }
      });
      setFieldValues(initialValues);
      setCalculationResult(null);
    }
  }, [selectedFormulaId, fields]);

  const handleFieldChange = (fieldId, value, fieldTypeName) => {
    const typeName = (fieldTypeName || 'number').toLowerCase();
    let coerced;
    if (typeName.includes('bool')) {
      // BOOLEAN — value is already 0 or 1 from the toggle
      coerced = value;
    } else if (typeName.includes('select')) {
      // SELECT — value comes from <select> onChange as a string, convert to number
      coerced = Number(value);
    } else {
      // NUMBER — original behaviour
      coerced = value === "" ? 0 : parseFloat(value);
    }
    setFieldValues(prev => ({ ...prev, [fieldId]: coerced }));
  };

  const handleCalculate = () => {
    if (!activeFormula) return;

    const sanitizedFieldValues = Object.fromEntries(
      Object.entries(fieldValues).map(([k, v]) => [
        k,
        typeof v === "number" && isFinite(v) ? v : 0
      ])
    );

    calculateMutation.mutate({
      category_id: categoryId,
      selected_formula_id: selectedFormulaId,
      selected_config_id: selectedConfigId || null,
      field_values: sanitizedFieldValues
    }, {
      onSuccess: (data) => {
        setCalculationResult(data);
      }
    });
  };

  const handleSave = () => {
    if (!calculationResult) {
      toast({
        title: t("leaf.noResults"),
        description: t("leaf.calcFirst"),
        variant: "destructive"
      });
      return;
    }

    const formattedResults = {};
    calculationResult.intermediate_results?.forEach(r => {
      formattedResults[r.output_key || r.label] = r.value;
    });

    saveResultMutation.mutate({
      project_id: projectId,
      category_id: categoryId,
      selected_formula_id: selectedFormulaId,
      selected_config_id: selectedConfigId || null,
      formula_version_snapshot: activeFormula?.version || 1,
      field_values: fieldValues,
      results: formattedResults,
      material_lines: calculationResult.material_lines || [],
      leaf_total: calculationResult.total_cost ?? 0,
    }, {
      onSuccess: () => {
        navigate(`/projects/${projectId}`);
      }
    });
  };

  return (
    <>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">{localize(node, 'name')}</h2>
            <div className="text-xs text-slate-400 font-mono mt-0.5">{node.name_ar} — {node.category_level}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSave}
            disabled={saveResultMutation.isPending || !calculationResult}
            className="px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {saveResultMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t("leaf.saveCalculation")}
          </button>
        </div>
      </header>

      <div className="p-4 md:p-8 space-y-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Input Fields & Formulas */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Select Formula */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                 <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
                   {t("leaf.methodology")}
                 </h4>
               </div>
               <div className="p-6">
                  {formulas.length > 0 ? (
                     <div className="flex flex-col gap-3">
                       {formulas.map(f => (
                         <label 
                           key={f.formula_id} 
                           className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedFormulaId === f.formula_id ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                         >
                           <input 
                             type="radio" 
                             name="formula" 
                             value={f.formula_id}
                             checked={selectedFormulaId === f.formula_id}
                             onChange={() => setSelectedFormulaId(f.formula_id)}
                             className="mt-1 w-4 h-4 text-primary focus:ring-primary border-slate-300"
                           />
                           <div className="flex-1">
                             <div className="font-bold text-slate-800 dark:text-slate-200 flex justify-between">
                                {localize(f, 'name') || f.name}
                                <span className="text-[10px] uppercase font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">v{f.version}</span>
                             </div>
                             <div className="text-xs font-mono text-slate-500 mt-1 p-1 bg-slate-50 dark:bg-slate-900 rounded">
                                {f.expression}
                             </div>
                           </div>
                         </label>
                       ))}
                     </div>
                  ) : (
                    <div className="text-sm text-slate-500">{t("leaf.noFormulas")}</div>
                  )}
               </div>
            </div>

            {/* Material Config */}
            {configs.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-primary" />
                    {t("leaf.materialConfig")}
                  </h4>
                </div>
                <div className="p-6">
                  <select 
                    className="w-full border rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all focus:outline-none dark:text-white border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                    value={selectedConfigId || ''}
                    onChange={(e) => setSelectedConfigId(e.target.value)}
                  >
                    {configs.map(c => (
                      <option key={c.config_id} value={c.config_id}>{c.name}</option>
                    ))}
                  </select>
                  {selectedConfigId && (
                     <p className="text-xs text-slate-500 mt-2">{configs.find(c => c.config_id === selectedConfigId)?.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic Fields */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  {t("leaf.dynamicFields")}
                </h4>
              </div>
              <div className="p-6 text-sm">
                {fields.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {fields.map((field) => {
                      const typeName = (field.field_type_name || 'number').toLowerCase();
                      const isBoolean = typeName.includes('bool');
                      const isSelect  = typeName.includes('select');
                      const currentVal = fieldValues[field.field_id];

                      // Parse SELECT options from JSON stored in default_value
                      let selectOptions = [];
                      if (isSelect) {
                        try { selectOptions = JSON.parse(field.default_value || '[]'); } catch { selectOptions = []; }
                      }

                      return (
                        <div key={field.field_id}>
                          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
                            <span>{localize(field, 'label') || field.label} {field.required && <span className="text-red-500">*</span>}</span>
                            {!field.is_computed && <span className="text-[10px] font-mono text-primary bg-primary/10 px-1 rounded">{t("leaf.input")}</span>}
                            {field.is_computed  && <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-1 rounded">{t("leaf.computed")}</span>}
                          </label>

                          {/* ── BOOLEAN toggle ─────────────────────────────── */}
                          {isBoolean && (
                            <button
                              type="button"
                              onClick={() => handleFieldChange(field.field_id, currentVal === 1 ? 0 : 1, typeName)}
                              className={`relative inline-flex h-10 w-full items-center justify-between rounded-lg border px-4 text-sm font-semibold transition-all
                                ${currentVal === 1
                                  ? 'bg-primary/10 border-primary text-primary'
                                  : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-500'}`}
                            >
                              <span>{currentVal === 1 ? t("leaf.yes") : t("leaf.no")}</span>
                              <span className={`w-5 h-5 rounded-full transition-colors ${currentVal === 1 ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`} />
                            </button>
                          )}

                          {/* ── SELECT dropdown ────────────────────────────── */}
                          {isSelect && (
                            <select
                              value={currentVal ?? selectOptions[0]?.value ?? 0}
                              onChange={(e) => handleFieldChange(field.field_id, e.target.value, typeName)}
                              className="w-full border rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all focus:outline-none dark:text-white border-slate-300 dark:border-slate-600 dark:bg-slate-800"
                            >
                              {selectOptions.map((opt, idx) => (
                                <option key={idx} value={opt.value}>{localize(opt, 'label') || opt.label}</option>
                              ))}
                            </select>
                          )}

                          {/* ── NUMBER input (default) ─────────────────────── */}
                          {!isBoolean && !isSelect && (
                            <div className="relative">
                              <input
                                type="number"
                                value={currentVal !== undefined ? currentVal : (parseFloat(field.default_value) || 0)}
                                onChange={(e) => handleFieldChange(field.field_id, e.target.value, typeName)}
                                readOnly={field.is_computed}
                                className={`w-full border rounded-lg py-2.5 pl-4 pr-12 focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all focus:outline-none dark:text-white ${field.is_computed ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed' : 'border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-slate-900'}`}
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                {field.unit_symbol}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400">{t("leaf.selectFormula")}</p>
                )}

                {/* Calculate Button */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <button 
                    onClick={handleCalculate}
                    disabled={calculateMutation.isPending || !activeFormula}
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 disabled:opacity-50"
                  >
                    {calculateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                    {t("leaf.runEstimation")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="xl:col-span-1">
            <div className="bg-blue-600 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col relative sticky top-6">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
               
               <div className="px-6 py-5 border-b border-blue-500/50 flex flex-col relative z-10">
                  <h4 className="font-bold flex items-center gap-2 text-lg">
                     <BarChart2 className="w-5 h-5 text-blue-300" />
                     {t("leaf.estimationResults")}
                  </h4>
               </div>
               
               <div className="p-6 relative z-10 flex flex-col gap-6">
                  
                  {!calculationResult ? (
                    <div className="text-center py-10 opacity-70">
                      <Calculator className="w-12 h-12 mx-auto mb-3 text-blue-300" />
                      <p>{t("leaf.configureFields")}</p>
                    </div>
                  ) : (
                    <>
                      {/* Primary Outputs */}
                      <div className="bg-blue-700/60 backdrop-blur-md rounded-2xl p-5 border border-blue-500/50 shadow-inner">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">{t("leaf.primaryOutputs")}</span>
                         </div>
                         <div className="space-y-4 mt-2">
                            {calculationResult.intermediate_results?.map((res, idx) => (
                              <div key={idx} className="flex justify-between items-end border-b border-blue-500/30 pb-2">
                                <span className="text-sm font-bold text-blue-100">{localize(res, 'output_label') || res.output_key}</span>
                                <div className="flex items-baseline gap-1" dir="ltr">
                                  <span className="text-xl font-black">{res.value % 1 !== 0 ? res.value.toFixed(2) : res.value}</span>
                                  <span className="text-xs text-blue-300 font-bold">{res.unit_symbol}</span>
                                </div>
                              </div>
                            ))}
                         </div>
                         <div className="mt-4 text-[10px] text-blue-300 font-mono">{t("leaf.basedOn")} {activeFormulaName}</div>
                      </div>

                      {/* Material Resources */}
                      <div>
                         <div className="flex items-center gap-2 mb-3">
                            <Package className="w-4 h-4 text-blue-300"/>
                            <h5 className="text-xs font-bold text-white uppercase tracking-wider">{t("leaf.requiredResources")}</h5>
                         </div>
                         
                         <div className="space-y-2">
                           {calculationResult.material_lines?.length > 0 ? (
                             calculationResult.material_lines.map((mat, idx) => (
                               <div key={idx} className="flex justify-between items-center bg-blue-800/40 rounded-xl p-3 border border-blue-700/50 hover:bg-blue-700/50 transition-colors">
                                  <div className="flex-1 pr-2 rtl:pl-2 rtl:pr-0">
                                     <div className="font-semibold text-sm truncate" title={localize(mat, 'material_name')}>{localize(mat, 'material_name')}</div>
                                     <div className="text-[10px] text-blue-300 font-mono mt-0.5">{t("history.waste")}: <span dir="ltr">{(mat.waste_factor * 100).toFixed(0)}%</span> — <span dir="ltr">{mat.unit_price_snapshot} {tc("currency")}/{mat.unit_symbol}</span></div>
                                  </div>
                                  <div className="text-right rtl:text-left shrink-0">
                                     <div className="font-bold text-sm" dir="ltr">{mat.quantity_with_waste?.toFixed(2)} {mat.unit_symbol}</div>
                                     <div className="text-[10px] text-blue-200 font-mono mt-0.5">{mat.sub_total?.toFixed(2)} {tc("currency")}</div>
                                  </div>
                               </div>
                             ))
                           ) : (
                             <div className="text-sm text-blue-300 bg-blue-800/30 rounded-xl p-4 text-center">{t("leaf.noMaterialLines")}</div>
                           )}
                         </div>
                      </div>

                      {/* Grand Total */}
                      <div className="pt-5 border-t border-blue-500/50 flex justify-between items-center mt-2">
                         <span className="text-sm font-bold text-blue-200">{t("leaf.totalLeafCost")}</span>
                         <span className="text-2xl font-black text-white text-emerald-300" dir="ltr">
                           {calculationResult.total_cost?.toFixed(2)} <span className="text-sm font-bold opacity-80">{tc("currency")}</span>
                         </span>
                      </div>
                    </>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeafCategory;