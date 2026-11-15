// Modules that are switched off. Their code is kept; set a flag to true once the module has real data behind it.
// payroll: no salary/CTC data model exists yet, so payslips would be invented figures.
export const FEATURES = {
  payroll: false
};

export const PAYROLL_MODULES = ['payroll-management', 'payroll-processing', 'emp-payroll', 'emp-payslips', 'emp-expenses'];
export const isModuleEnabled = (id) => FEATURES.payroll || !PAYROLL_MODULES.includes(id);
