/**
 * @typedef {Object.<string, string>} TranslationMap
 * @typedef {Object.<string, TranslationMap>} LanguageMap
 */

/** @type {LanguageMap} */
const translations = {
  en: {
    appName: 'Employee Management',
    home: 'Home',
    listEmployees: 'Employees',
    addEmployee: 'Add New',
    editEmployee: 'Edit Employee',
    deleteEmployee: 'Delete Employee',
    view: 'View',
    listView: 'List View',
    tableView: 'Table View',
    search: 'Search',
    firstName: 'First Name',
    lastName: 'Last Name',
    dateOfEmployment: 'Date of Employment',
    dateOfBirth: 'Date of Birth',
    phoneNumber: 'Phone Number',
    emailAddress: 'Email Address',
    department: 'Department',
    position: 'Position',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    noEmployeesFound: 'No employees found.',
    page: 'Page',
    of: 'of',
    previous: 'Previous',
    next: 'Next',
    addRecord: 'Add New Record',
    editRecord: 'Edit Record',
    save: 'Save',
    cancel: 'Cancel',
    requiredField: 'This field is required.',
    invalidEmail: 'Please enter a valid email address.',
    invalidPhone: 'Please enter a valid phone number (e.g., XXX-XXX-XXXX).',
    invalidDate: 'Please enter a valid date (YYYY-MM-DD).',
    dateInFuture: 'Date cannot be in the future.',
    employmentDateAfterBirth: 'Employment date cannot be before birth date.',
    emailTaken: 'This email address is already taken.',
    phoneTaken: 'This phone number is already taken.',
    confirmDeleteTitle: 'Confirm Deletion',
    confirmDeleteMessage: 'Are you sure you want to delete this employee record?',
    confirmUpdateTitle: 'Confirm Update',
    confirmUpdateMessage: 'Are you sure you want to update this employee record?',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    employeeAddedSuccess: 'Employee added successfully!',
    employeeUpdatedSuccess: 'Employee updated successfully!',
    employeeDeletedSuccess: 'Employee deleted successfully!',
    employeeNotFound: 'Employee not found.',
    departmentAnalytics: 'Analytics',
    departmentTech: 'Tech',
    departmentHR: 'HR',
    departmentMarketing: 'Marketing',
    departmentSales: 'Sales',
    positionJunior: 'Junior',
    positionMedior: 'Medior',
    positionSenior: 'Senior',
    selectDepartment: 'Select Department',
    selectPosition: 'Select Position',
    validationError: 'Validation Error',
    uniquenessError: 'Uniqueness Error',
    confirmSubmission: 'Confirm Submission',
    confirmSubmissionMessage: 'Are you sure you want to submit this form?',
    employeeList: 'Employee List',
    confirmBulkDeleteMessage: "Are you sure you want to deleted selected records?",
  },
  tr: {
    appName: 'Çalışan Yönetim Uygulaması',
    home: 'Ana Sayfa',
    listEmployees: 'Çalışan Listesi',
    addEmployee: 'Çalışan Ekle',
    editEmployee: 'Çalışan Düzenle',
    deleteEmployee: 'Çalışan Sil',
    view: 'Görünüm',
    listView: 'Liste Görünümü',
    tableView: 'Tablo Görünümü',
    search: 'Ara',
    firstName: 'Ad',
    lastName: 'Soyad',
    dateOfEmployment: 'İşe Giriş Tarihi',
    dateOfBirth: 'Doğum Tarihi',
    phoneNumber: 'Telefon Numarası',
    emailAddress: 'E-posta Adresi',
    department: 'Departman',
    position: 'Pozisyon',
    actions: 'İşlemler',
    edit: 'Düzenle',
    delete: 'Sil',
    noEmployeesFound: 'Çalışan bulunamadı.',
    page: 'Sayfa',
    of: 'toplam',
    previous: 'Önceki',
    next: 'Sonraki',
    addRecord: 'Yeni Kayıt Ekle',
    editRecord: 'Kaydı Düzenle',
    save: 'Kaydet',
    cancel: 'İptal',
    requiredField: 'Bu alan zorunludur.',
    invalidEmail: 'Lütfen geçerli bir e-posta adresi girin.',
    invalidPhone: 'Lütfen geçerli bir telefon numarası girin (örn: XXX-XXX-XXXX).',
    invalidDate: 'Lütfen geçerli bir tarih girin (YYYY-AA-GG).',
    dateInFuture: 'Tarih gelecekte olamaz.',
    employmentDateAfterBirth: 'İşe giriş tarihi doğum tarihinden önce olamaz.',
    emailTaken: 'Bu e-posta adresi zaten kullanımda.',
    phoneTaken: 'Bu telefon numarası zaten kullanımda.',
    confirmDeleteTitle: 'Silme Onayı',
    confirmDeleteMessage: 'Bu çalışan kaydını silmek istediğinizden emin misiniz?',
    confirmUpdateTitle: 'Güncelleme Onayı',
    confirmUpdateMessage: 'Bu çalışan kaydını güncellemek istediğinizden emin misiniz?',
    yes: 'Evet',
    no: 'Hayır',
    ok: 'Tamam',
    employeeAddedSuccess: 'Çalışan başarıyla eklendi!',
    employeeUpdatedSuccess: 'Çalışan başarıyla güncellendi!',
    employeeDeletedSuccess: 'Çalışan başarıyla silindi!',
    employeeNotFound: 'Çalışan bulunamadı.',
    departmentAnalytics: 'Analiz',
    departmentTech: 'Teknoloji',
    departmentHR: 'İnsan Kaynakları',
    departmentMarketing: 'Pazarlama',
    departmentSales: 'Satış',
    positionJunior: 'Junior',
    positionMedior: 'Medior',
    positionSenior: 'Senior',
    selectDepartment: 'Departman Seçin',
    selectPosition: 'Pozisyon Seçin',
    validationError: 'Doğrulama Hatası',
    uniquenessError: 'Benzersizlik Hatası',
    confirmSubmission: 'Gönderimi Onayla',
    confirmSubmissionMessage: 'Bu formu göndermek istediğinizden emin misiniz?',
    employeeList: 'Çalışan Listesi',
    confirmBulkDeleteMessage: "Seçili olanları silmek istediğinizden emin misiniz?",
  }
};

class I18n {
  constructor() {
    this.currentLang = this._detectInitialLanguage();
  }

  /**
   * Tries to detect the browser or document language.
   * Defaults to 'en' if unsupported.
   * @private
   * @returns {string}
   */
  _detectInitialLanguage() {
    const htmlLang = document.documentElement.lang;
    if (htmlLang && translations[htmlLang]) {
      return htmlLang;
    }

    const browserLang = navigator.language.split('-')[0];
    return translations[browserLang] ? browserLang : 'en';
  }

  /**
   * Sets the active language and updates the HTML lang attribute.
   * @param {string} lang
   */
  setLanguage(lang) {
    if (!translations[lang]) {
      console.warn(`Unsupported language: ${lang}`);
      return;
    }

    this.currentLang = lang;
    document.documentElement.lang = lang;
    // Optional: emit event if needed
    // window.dispatchEvent(new CustomEvent('language-changed', { detail: lang }));
  }

  /**
   * Retrieves a translation for a given key.
   * Falls back to the key itself if missing.
   * @param {string} key
   * @returns {string}
   */
  getTranslation(key) {
    return translations[this.currentLang]?.[key] ?? key;
  }

  /**
   * Gets the current language code.
   * @returns {string}
   */
  getCurrentLanguage() {
    return this.currentLang;
  }

  /**
   * Lists all supported language codes.
   * @returns {string[]}
   */
  getSupportedLanguages() {
    return Object.keys(translations);
  }
}

// Export as singleton
export const i18n = new I18n();
