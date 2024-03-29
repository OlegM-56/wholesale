"use strict";

const main_url = ''
const perpage_default = 12

const loadComponents = function(name) {
  let version = ''
  if (typeof app != 'undefined') {
    if (typeof app.appVersion != 'undefined') {
      if (app.appVersion != null) {
        version = '?' + app.appVersion
      }
    }
  }

  if (loadComponents.components.indexOf(name) == -1) {
    let jsfile = '/static/vue-app/' + name
    loadJS(jsfile + version)
    loadComponents.components.push(name)
  }
}
loadComponents.components = []


const loadJS = function(name) {
  if (loadJS.files.indexOf(name) == -1) {
    let script = document.createElement('script')
    script.src = name
    script.async = true
    document.head.appendChild(script)
    loadJS.files.push(name)
  }
}
loadJS.files = []


/* Common storage */
const store = new Vuex.Store({
  state: {
    title: ''
  },
  mutations: {
    title (state, value) {
      state.title = value
    }
  }
})

/* ROUTES */
const routes = [
  /*  Інформація */
  { path: '/',
    component: { template: '<main-page v-if="router.app.componentsReady(`main-page`)" />' },
    beforeEnter (to, from, next) { loadComponents("info-pages.js"); next() }
  },

  { path: '/task_description',
    component: { template: '<task_description v-if="router.app.componentsReady(`task_description`)" />' },
    beforeEnter (to, from, next) { loadComponents("info-pages.js"); next() }
  },

  { path: '/database',
    component: { template: '<database v-if="router.app.componentsReady(`database`)" />' },
    beforeEnter (to, from, next) { loadComponents("info-pages.js"); next() }
  },
  { path: '/implementation',
    component: { template: '<implementation v-if="router.app.componentsReady(`implementation`)" />' },
    beforeEnter (to, from, next) { loadComponents("info-pages.js"); next() }
  },
  { path: '/video_presentation_1',
    component: { template: '<video_presentation_1 v-if="router.app.componentsReady(`video_presentation_1`)" />' },
    beforeEnter (to, from, next) { loadComponents("info-pages.js"); next() }
  },
  { path: '/video_presentation_2',
    component: { template: '<video_presentation_2 v-if="router.app.componentsReady(`video_presentation_2`)" />' },
    beforeEnter (to, from, next) { loadComponents("info-pages.js"); next() }
  },

  /*  Звіти */
  { path: '/report/:instance', component: { template: '<instance-report />' } },

  /*  Універсальні роути */
  { path: '/:instance', component: { template: '<instance-page />' } },
  { path: '/:instance/page/:page', component: { template: '<instance-page />' } },
  { path: '/:instance/prm/:prm', component: { template: '<instance-page />' } },
  { path: '/:instance/:id', component: { template: '<instance-edit />' } },

  /*  Коригування накладних */
  { path: '/invoice/:instance/:id', component: { template: '<invoce-edit />' } },
  { path: '/:instance/:id/:main_id/:max_npp', component: { template: '<instance-edit />' } }
]

const router = new VueRouter({routes})
const urlHash = '#'

const appDataset = {
  /* ---  Головне меню --- */
  'menu':{
    'instance': 'menu',
    'url': main_url + 'menu/',
  },
  /* ---  Статус накладної --- */
  'status_doc':{
    'instance': 'status_doc',
    'url': main_url + 'status_doc/',
  },

  /* ---  Контрагенти --- */
  'client': {
    'instance': 'client',
    'url': main_url + 'client/',
    'title': 'Контрагенти',
    'perpage': perpage_default,
    'fields': {
      'table': [
        {name:'id', 'title': 'Код', type:'integer', sort: true},
        {name:'customer_name', 'title': 'Повна назва', type:'string', sort: true},
      ],
      'form': [
        {name:'id', 'title': 'Код', type:'number', readonly:true},
        {name:'customer_name', 'title': 'Повна назва', type:'string', placeholder: 'Внесіть повну назву кліента', maxlength: 70, required: true},
        {name:'customer_address', 'title': 'Адреса клієнта', type:'string', placeholder: 'Внесить адресу кліента', maxlength: 100, required: true},
        {name:'phone', 'title': 'Контактний телефонPhone', type:'string', pattern: '\\(\\d{3}\\)\\d{3}-\\d{2}-\\d{2}', placeholder: '(999)999-99-99'},
      ]
    }
  },

  /* --- Одиниці виміру --- */
  'unit': {
    'instance': 'unit',
    'url': main_url + 'unit/',
    'perpage': perpage_default,
    'title': 'Одиниці виміру',
    'pk': 'unit_code',
    'fields': {
      'table': [
        {name:'unit_code', 'title': 'Код', type:'string', sort: true},
        {name:'unit_name', 'title': 'Назва одиниці виміру', type:'string', sort: true},
      ],
      'form': [
        {name:'unit_code', 'title': 'Код', type:'string', maxlength: 10, readonly:true},
        {name:'unit_name', 'title': 'Назва одиниці виміру', type:'string', maxlength: 15, readonly:true},
      ]
    }
  },

/* --- Групи товарів/послуг --- */
  'group_item': {
    'instance': 'group_item',
    'url': main_url + 'group_item/',
    'perpage': perpage_default,
    'order': '["group_name"]',
    'title': 'Групи товарів (послуг)',
    'fields': {
      'table': [
        {name:'id', 'title': 'Код групи', type:'number', sort: true},
        {name:'group_name', 'title': 'Назва групи', type:'string', sort: true},
        {name:'group_description', 'title': 'Опис групи', type:'string'},
      ],
      'form': [
        {name:'id', 'title': 'Код групи', type:'number'},
        {name:'group_name', 'title': 'Назва групи', type:'string', maxlength: 50, required:'required'},
        {name:'group_description', 'title': 'Опис групи', type:'string', maxlength: 150},
      ]
    }
  },

  /* ---  Товари та послуги --- */
  'item': {
    'instance': 'item',
    'url': main_url + 'item/',
    'perpage': perpage_default,
    'order': '["item_name"]',
    'title': 'Товари та послуги',
    'fields': {
      'table': [
        {name:'id', 'title': 'Код', type:'number', sort: true},
        {name:'item_name', 'title': 'Назва', type:'string', sort: true},
        {name:'unit', 'title': 'Одиниця виміру', type:'select', sort: true},
        {name:'service', 'title': 'Послуга', type:'string', sort: true},
        {name:'group_name', 'title': 'Група товару (послуги)', type:'number', sort: true}
      ],
      'form': [
        {name:'id', 'title': 'Код', type:'number', readonly:true},
        {name:'item_name', 'title': 'Назва товару (послуги)', type:'string', maxlength: 50, required:true},
        {name:'unit', 'title': 'Одиниця виміру', type:'select', dataset: {src: 'unit', value: 'unit_code', caption: 'unit_name'}, required:true},
        {name:'service', 'title': '', type:'radio', items:[{value:'', caption:'Товар'},{value:'Так', caption:'Послуга'}]},
        {name:'group_id', 'title': 'Група товару (послуги)', type:'select', dataset: {src: 'group_item', value: 'id', caption: 'group_name'}, required:true},
        {name:'item_description', 'title': 'Опис товару (послуги)', type:'string', maxlength: 150, required:false}
      ]
    }
  },

  /* ----- Актуальний Прайс ------------  */
  'price_list': {
    'instance': 'price_list',
    'url': main_url + 'price_list/',
    'title': 'Актуальний Прайс-лист товарів та послуг',
    'perpage': perpage_default,
    'fields': {
      'table': [
        {name:'id', 'title': 'Код рядка', type:'number', sort:true},
        {name:'item_id', 'title': 'Код товару', type:'string', sort:true},
        {name:'item_name', 'title': 'Назва товару', type:'string', sort:true},
        {name:'unit', 'title': 'Одиниця виміру', type:'string'},
        {name:'price', 'title': 'Оптова ціна', type:'number', sort:true},
        {name:'service', 'title': 'Послуга', type:'string', sort: true},
        {name:'is_actual', 'title': 'Актуально', type:'string', sort: true},
      ],
      'form': [
        {name:'id', 'title': 'Код рядка', type:'number', readonly:true},
        {name:'item_id', 'title':'Товар', type:'select', dataset:{src: 'item', value:'id', caption:'item_name'}, required:true},
        {name:'unit', 'title': 'Одиниця виміру', type:'string', readonly:true},
        {name:'price', 'title':'Ціна', type:'number', min:0.01, step:0.01, required:true},
        {name:'service', 'title': 'Послуга', type:'string', readonly:true},
        {name:'is_actual', 'title': '', type:'radio', items:[{value:'', caption:'Disabled'},{value:'Так', caption:'Актуально'}]},
      ]
    }
  },


  /* ----- Поточні залишки по партіях ------------
  //      'form': [
//        {name:'party_id', 'title': 'Код партії', type:'number', readonly:true},
//        {name:'item_id', 'title': 'Код товару', type:'string', readonly:true},
//        {name:'item_name', 'title': 'Назва товару', type:'string', readonly:true},
//        {name:'date_receipt', 'title': 'Дата приходу', type:'mydate', readonly:true},
//        {name:'cost', 'title': 'Ціна закупки', type:'number', readonly:true},
//        {name:'unit', 'title': 'Одиниця виміру', type:'string', readonly:true},
//        {name:'quantity', 'title': 'Залишок', type:'number', readonly:true},
//      ]

  */
  'balance_item': {
    'instance': 'balance_item',
    'url': main_url + 'balance_item/',
    'title': 'Поточні залишки по партіях',
    'pk': 'party_id',
    'perpage': perpage_default,
    'fields': {
      'table': [
        {name:'party_id', 'title': 'Код партії', type:'number', sort:true},
        {name:'item_id', 'title': 'Код товару', type:'string', sort:true},
        {name:'item_name', 'title': 'Назва товару', type:'string', sort:true},
        {name:'date_receipt', 'title': 'Дата приходу', type:'mydate', sort:true},
        {name:'cost', 'title': 'Ціна закупки', type:'number', sort:true},
        {name:'unit', 'title': 'Одиниця виміру', type:'string'},
        {name:'quantity', 'title': 'Залишок', type:'number', sort:true},
      ]
    }
  },

  /* ----- Прибуткова накладна ------------  */
  'pinvoice': {
    'instance': 'pinvoice',
    'instance_detail': 'pinvoice_row',
    'url': main_url + 'pinvoice/',
    'title': 'Прибуткові накладні',
    'pk': 'num_doc',
    'perpage': perpage_default,
    'fields': {
      'table': [
        {name:'num_doc', 'title': 'Номер документу', type:'number', sort:true},
        {name:'doc_date', 'title': 'Дата документу', type:'mydate', sort:true},
        {name:'customer_name', 'title': 'Постачальник', type:'string', sort:true},
        {name:'doc_status_name', 'title': 'Статус', type:'string', sort:true},
        {name:'doc_date_approve', 'title': 'Дата проведення', type:'mydate', sort:true},
        {name:'sum_doc', 'title':'Сума по документу, грн.', type:'string'},
        {name:'custom_numdoc', 'title': 'Номер документу постачальника', type:'string', sort:true},
      ],
      'form': [
        {name:'num_doc', 'title': 'Номер документу', type:'number', readonly:true},
        {name:'doc_date', 'title': 'Дата документу', type:'mydate', required:'required'},
        {name:'customer_id', 'title': 'Постачальник', type:'select', dataset: {src: 'client', value: 'id', caption: 'customer_name'}, required:true},
        {name:'custom_numdoc', 'title': 'Номер документу постачальника', type:'string'},
        {name:'doc_status_name', 'title': 'Статус', type:'string', readonly:true},
        {name:'doc_date_approve', 'title': 'Дата проведення', type:'mydate'},
        {name:'sum_doc', 'title':'Сума по документу, грн.', type:'string', readonly:true},
      ],
      'form_readonly': [
        {name:'num_doc', 'title': 'Номер документу', type:'number', readonly:true},
        {name:'doc_date', 'title': 'Дата документу', type:'mydate', readonly:true},
        {name:'customer_name', 'title': 'Постачальник', type:'string', readonly:true},
        {name:'custom_numdoc', 'title': 'Номер документу постачальника', type:'string', readonly:true},
        {name:'doc_status_name', 'title': 'Статус', type:'string', readonly:true},
        {name:'doc_date_approve', 'title': 'Дата проведення', type:'mydate', readonly:true},
        {name:'sum_doc', 'title':'Сума по документу, грн.', type:'string', readonly:true},
      ]
    }
  },

  /* ----- рядки Прибуткова накладна ------------  */
  'pinvoice_row': {
    'instance': 'pinvoice_row',
    'url': main_url + 'pinvoice_row/',
    'title': 'Рядки прибуткової накладної',
    'perpage': perpage_default,
    'main_id': 'pinvoice_id',
    'order': '["npp"]',
    'fields': {
      'table': [
        {name:'npp', 'title':'№ пп', type:'number'},
        {name:'item_id', 'title':'Код товару', type:'string'},
        {name:'item_name', 'title':'Назва товару', type:'string'},
        {name:'unit', 'title':'Одиниця виміру', type:'string'},
        {name:'quantity', 'title':'Кількість', type:'number0'},
        {name:'price', 'title':'Ціна', type:'number2'},
        {name:'amount', 'title':'Сума', type:'number2', readonly:true},
      ],
      'form': [
        {name:'id', 'title':'Код рядка', type:'number', readonly:true},
        {name:'pinvoice_id', 'title':'Код накладної', type:'number', readonly:true},
        {name:'npp', 'title': '№ пп', type:'number', readonly:true},
        {name:'item_id', 'title':'Товар', type:'select', dataset:{src: 'item', value:'id', caption:'item_name'}, required:true},
        {name:'quantity', 'title':'Кількість', type:'number', min:0.001, step:0.001, required:true, calc_amount:true},
        {name:'price', 'title':'Ціна', type:'number', min:0.01, step:0.01, required:true, calc_amount:true},
        {name:'amount', 'title':'Сума', type:'number', readonly:true},
      ]
    }
  },

  /* ----- Видаткова накладна ------------  */
  'einvoice': {
    'instance': 'einvoice',
    'instance_detail': 'einvoice_row',
    'instance_wh_order': 'wh_order_einvoice',
    'url': main_url + 'einvoice/',
    'title': 'Видаткові накладні',
    'pk': 'num_doc',
    'perpage': perpage_default,
    'fields': {
      'table': [
        {name:'num_doc', 'title': 'Номер документу', type:'number', sort:true},
        {name:'customer_name', 'title': 'Отримувач', type:'string', sort:true},
        {name:'doc_date', 'title': 'Дата документу', type:'mydate', sort:true},
        {name:'doc_status_name', 'title': 'Статус', type:'string', sort:true},
        {name:'doc_date_approve', 'title': 'Дата проведення', type:'mydate', sort:true},
        {name:'sum_doc', 'title':'Сума по документу, грн.', type:'number2'}

      ],
      'form': [
        {name:'num_doc', 'title': 'Номер документу', type:'number', readonly:true},
        {name:'customer_id', 'title': 'Отримувач', type:'select', dataset: {src: 'client', value: 'id', caption: 'customer_name'} },
        {name:'doc_date', 'title': 'Дата документу', type:'mydate', required:'required'},
        {name:'doc_status_name', 'title': 'Статус', type:'string', readonly:true},
        {name:'doc_date_approve', 'title': 'Дата проведення', type:'mydate'},
        {name:'sum_doc', 'title':'Сума по документу, грн.', type:'string', readonly:true}
      ],
      'form_readonly': [
        {name:'num_doc', 'title': 'Номер документу', type:'number', readonly:true},
        {name:'customer_name', 'title': 'Отримувач', type:'string', readonly:true},
        {name:'doc_date', 'title': 'Дата документу', type:'mydate', readonly:true},
        {name:'doc_status_name', 'title': 'Статус', type:'string', readonly:true},
        {name:'doc_date_approve', 'title': 'Дата проведення', type:'mydate', readonly:true},
        {name:'sum_doc', 'title':'Сума по документу, грн.', type:'string', readonly:true}
      ]
    }
  },

  /* ----- рядки Видаткової накладної ------------  */
  'einvoice_row': {
    'instance': 'einvoice_row',
    'url': main_url + 'einvoice_row/',
    'title': 'Рядки видаткової накладної',
    'perpage': perpage_default,
    'main_id': 'einvoice_id',
    'order': '["npp"]',
    'fields': {
      'table': [
        {name:'npp', 'title':'№ пп', type:'number'},
        {name:'item_id', 'title':'Код товару', type:'string'},
        {name:'item_name', 'title':'Назва товару', type:'string'},
        {name:'unit', 'title':'Одиниця виміру', type:'string'},
        {name:'quantity', 'title':'Кількість', type:'number0'},
        {name:'price', 'title':'Ціна', type:'number2'},
        {name:'amount', 'title':'Сума', type:'number2'}
      ],
      'form': [
        {name:'id', 'title':'Код рядка', type:'number', readonly:true},
        {name:'einvoice_id', 'title':'Код накладної', type:'number', readonly:true},
        {name:'npp', 'title':'№ пп', type:'number', readonly:true},
        {name:'item_id', 'title':'Товар', type:'select', dataset: {src: 'item', value: 'id', caption: 'item_name'}, required:true, get_price:true},
        {name:'quantity', 'title':'Кількість', type:'number', required:true, min:0.001, step:0.001, calc_amount:true},
        {name:'price', 'title':'Ціна', type:'number', required:true, min:0.01, step:0.01, calc_amount:true},
        {name:'amount', 'title':'Сума', type:'number', readonly:true}
      ]
    }
  },


  /* ----- Складський ордер до Видаткової накладної ------------  */
  'wh_order_einvoice': {
    'instance': 'einvoice',
    'instance_detail': 'wh_order_row',
    'url': main_url + 'einvoice/',
    'title': 'Складський ордер до Видаткової накладної',
    'pk': 'num_doc',
    'perpage': perpage_default,
    'fields': {
      'table': [
        {name:'num_doc', 'title': 'Номер документу', type:'number', sort:true},
        {name:'customer_name', 'title': 'Отримувач', type:'string', sort:true},
        {name:'doc_date', 'title': 'Дата документу', type:'mydate', sort:true},
        {name:'doc_status_name', 'title': 'Статус', type:'string', sort:true},
        {name:'doc_date_approve', 'title': 'Дата проведення', type:'mydate', sort:true},
      ],
      'form': [
        {name:'num_doc', 'title': 'Номер документу', type:'number', readonly:true},
        {name:'doc_date', 'title': 'Дата документу', type:'mydate', readonly:true},
        {name:'customer_name', 'title': 'Отримувач', type:'string', readonly:true},
        {name:'doc_status_name', 'title': 'Статус', type:'string', readonly:true},
        {name:'doc_date_approve', 'title': 'Дата проведення', type:'mydate', readonly:true},
      ],
      'form_readonly': [
        {name:'num_doc', 'title': 'Номер документу', type:'number', readonly:true},
        {name:'doc_date', 'title': 'Дата документу', type:'mydate', readonly:true},
        {name:'customer_name', 'title': 'Отримувач', type:'string', readonly:true},
        {name:'doc_status_name', 'title': 'Статус', type:'string', readonly:true},
        {name:'doc_date_approve', 'title': 'Дата проведення', type:'mydate', readonly:true},
      ]
    }
  },

  /* ----- рядки Складського ордеру до видаткової накладної ------------  */
  'wh_order_row': {
    'instance': 'wh_order_row',
    'url': main_url + 'wh_order_row/',
    'title': 'Рядки Складського ордеру до видаткової накладної',
    'main_id': 'einvoice_id',
    'order': '["einvoice_row_id","id"]',
    'perpage': perpage_default,
    'fields': {
      'table': [
        {name:'npp', 'title':'№ пп рядка накладної', type:'number'},
        {name:'item_name', 'title': 'Назва товару', type:'string'},
        {name:'party_id', 'title':'Код партії', type:'number'},
        {name:'date_receipt', 'title': 'Дата приходу', type:'mydate'},
        {name:'cost', 'title': 'Ціна закупки', type:'number'},
        {name:'quantity', 'title':'Кількість', type:'number'},
        {name:'unit', 'title': 'Одиниця виміру', type:'string'}
      ]
    }
  },

  /*  =====================   ЗВІТИ =================================== */
  /* ----- Залишки товарів на дату  ------------  */
  'rep_balance_item': {
    'instance': 'rep_balance_item',
    'url': main_url + 'report/rep_balance_item/',
    'title': 'Залишки товарів на дату',
    'perpage': perpage_default,
    'fields': {
      'table': [
        {name:'id', 'title':'Код товару', type:'number', sort:true},
        {name:'item_name', 'title': 'Назва товару', type:'string', sort:true},
        {name:'unit', 'title': 'Одиниця виміру', type:'string'},
        {name:'balance_item', 'title':'Залишок', type:'number0', sort:true},
        {name:'balance_sum_item', 'title':'Залишок по цінам приходу, грн.', type:'number2', sort:true},
        {name:'balance_pricesum_item', 'title':'Залишок по прайсовим цінам, грн.', type:'number2', sort:true},
      ],
      'form': [
        {name:'date_rep', 'title': 'Залишки на дату', type:'mydate', required:'required'}
      ],
    }
  },

  /* ----- Оборотна відомість товарів за період  ------------  */
  'rep_circulation_item': {
    'instance': 'rep_circulation_item',
    'url': main_url + 'report/rep_circulation_item/',
    'title': 'Оборотна відомість товарів за період',
    'perpage': perpage_default,
    'fields': {
      'table': [
        {name:'id', 'title':'Код товару', type:'number', sort:true},
        {name:'item_name', 'title': 'Назва товару', type:'string', sort:true},
        {name:'unit', 'title': 'Одиниця виміру', type:'string'},
        {name:'start_balance_item', 'title':'Початковий залишок', type:'number0'},
        {name:'receipt_item', 'title':'Надходження', type:'number0'},
        {name:'expense_item', 'title':'Витрата', type:'number0'},
        {name:'balance_item', 'title':'Залишок', type:'number0'}
      ],
      'form': [
        {name:'date_start', 'title': 'Початкова дата періоду', type:'mydate', required:'required'},
        {name:'date_end', 'title': 'Кінцева дата періоду', type:'mydate', required:'required'}
      ]
    }
  },

  /* ----- Обсяги продажу товарів за період  ------------  */
  'rep_sale_item': {
    'instance': 'rep_sale_item',
    'url': main_url + 'report/rep_sale_item/',
    'title': 'Обсяги продажу товарів за період',
    'perpage': perpage_default,
    'fields': {
      'table': [
        {name:'id', 'title':'Код товару', type:'number', sort:true},
        {name:'item_name', 'title': 'Назва товару', type:'string', sort:true},
        {name:'unit', 'title': 'Одиниця виміру', type:'string'},
        {name:'sales_item', 'title':'Кількість', type:'number0', sort:true},
        {name:'sales_money_item', 'title':'Сума продажу, грн.', type:'number2', sort:true}
      ],
      'form': [
        {name:'date_start', 'title': 'Початкова дата періоду', type:'mydate', required:'required'},
        {name:'date_end', 'title': 'Кінцева дата періоду', type:'mydate', required:'required'}
      ]
    }
  },

  /* ----- Прибуток від продажу за період  ------------  */
  'profit_sale_item': {
    'instance': 'profit_sale_item',
    'url': main_url + 'report/profit_sale_item/',
    'title': 'Прибуток від продажу за період',
    'perpage': perpage_default,
    'fields': {
      'table': [
        {name:'id', 'title':'Код товару', type:'number', sort:true},
        {name:'item_name', 'title': 'Назва товару', type:'string', sort:true},
        {name:'unit', 'title': 'Одиниця виміру', type:'string'},
        {name:'sales_item', 'title':'Кількість', type:'number0', sort:true},
        {name:'sales_money_item', 'title':'Виручка від продажу, грн.', type:'number2', sort:true},
        {name:'purchase_money_item', 'title':'Витрати на закупку, грн.', type:'number2', sort:true},
        {name:'profit_item', 'title':'Сума прибуткуу, грн.', type:'number2', sort:true}
      ],
      'form': [
        {name:'date_start', 'title': 'Початкова дата періоду', type:'mydate', required:'required'},
        {name:'date_end', 'title': 'Кінцева дата періоду', type:'mydate', required:'required'}
      ]
    }
  },

  /* ----- ABC-аналіз за період  ------------  */
  'abc_analysis': {
    'instance': 'profit_sale_item',
    'url': main_url + 'report/abc_analysis/',
    'title': 'ABC-аналіз продажу за період (виручка та прибуток)',
    'perpage': perpage_default,
    'fields': {
      'table': [
        {name:'id', 'title':'Код товару', type:'number'},
        {name:'item_name', 'title': 'Назва товару', type:'string'},
        {name:'amount_indicator', 'title':'Виручка від продажу, грн.', type:'number2', 'title2': 'Прибуток від продажу, грн.'},
        {name:'percentage', 'title':'Питома вага, %', type:'number'},
        {name:'cumulative_percentage', 'title':'Накопичена частка, %', type:'number'},
        {name:'group', 'title':'Група', type:'string'}
      ],
      'form': [
        {name:'date_start', 'title': 'Початкова дата періоду', type:'mydate', required:'required'},
        {name:'date_end', 'title': 'Кінцева дата періоду', type:'mydate', required:'required'},
        {name:'type_rep', 'title': 'Аналізуємо', type:'radio', items:[{value:'', caption:'Виручка'},{value:'profit', caption:'Прибуток'}]}
      ]
    }
  },

  /* ----- Обсяги продажу за період по групам  ------------  */
  'rep_sale_sroup': {
    'instance': 'rep_sale_sroup',
    'url': main_url + 'report/rep_sale_sroup/',
    'title': 'Обсяги продажу за період по групам',
    'perpage': perpage_default,
    'fields': {
      'table': [
        {name:'id', 'title':'Код групи', type:'number'},
        {name:'group_name', 'title': 'Назва групи', type:'string'},
        {name:'sales_money_group', 'title':'Сума продажу, грн.', type:'number2'}
      ],
      'form': [
        {name:'date_start', 'title': 'Початкова дата періоду', type:'mydate', required:'required'},
        {name:'date_end', 'title': 'Кінцева дата періоду', type:'mydate', required:'required'}
      ]
    }
  },

}


var app = new Vue({
  el: '#App',
  router: router,
  store: store,

  data: {
    appVersion: '0.1',
    components: [],
    notifications: []
  },

  mounted: function () {
      this.$material.locale.dateFormat = 'dd.MM.yyyy'
      this.$material.locale.firstDayOfAWeek = 1
  },
  methods: {
    componentsLoaded: function (component) {
      if (this.components.indexOf(component) == -1)
        this.components.push(component)
    },

    componentsReady: function (component) {
      return this.components.indexOf(component) > -1 ? true : false
    },

    alert: function (massage, title = null) {
      let options = {
        html: true,
        okText: 'OK',
        type: 'basic',
        backdropClose: true
      }
      if (title !== null) {
        massage = '<div class="h4 mn pn mb5">' + title + '</div>' + massage
      }
      return this.$dialog.alert(massage, options)
    },

    confirm: function (massage) {
      let options = {
        html: true,
        animation: 'zoom',
        okText: 'ТАК',
        cancelText: 'Ні',
        type: 'basic',
        backdropClose: true
      }
      return this.$dialog.confirm(massage, options)
    },

    confirm3btn: function (message, captions={}) {
      let btn_captions = {
        'yes': 'Так',
        'no': 'Ні',
        'cancel': 'Скасувати'
      }

      btn_captions = Object.assign(btn_captions, captions)

      let options = {
        view: Confirm3Btn,
        html: true,
        animation: 'zoom',
        backdropClose: true,
        type: 'basic',
        yesText: btn_captions.yes,
        noText: btn_captions.no,
        cancelText: btn_captions.cancel
      }
      return this.$dialog.alert(message, options)
    },

    prompt: function (message, value) {
      let options = {
        view: CustomPrompt,
        html: true,
        animation: 'zoom',
        backdropClose: true,
        type: 'basic',
        yesText: 'Прийняти',
        cancelText: 'Скасувати',
        value: value
      }
      return this.$dialog.alert(message, options)
    },

    notify: function (notification) {
      if (this.notifications.length > 0) {
        let prevNotfy = this.notifications[this.notifications.length-1]
        if (prevNotfy.type != notification.type || prevNotfy.message != notification.message) {
          this.notifications.push(notification)
        }
      }
      else {
        this.notifications.push(notification)
      }
    },

    onDismissNotify: function ($event) {
      this.notifications.splice($event, 1)
    },

    navigate: function (path) {
      router.push(path)
    },

    getRoutePath: function () {
      return this.$route.fullPath
    },

    getRouteParam: function (name) {
      return this.$route.params[name]
    },

    loadSettings: function () {
      let settings_text = localStorage.getItem('appSettings')
      if (settings_text == '' ) {
        settings_text = null
      }
      let settings = JSON.parse(settings_text)
      if (settings == null) {
        settings = {}
      }
      return settings
    },

    saveSettings: function(settings) {
      localStorage.setItem('appSettings', JSON.stringify(settings))
    },

    getSettings: function (path, defaultValue = null) {
      let settings = this.loadSettings()

      if (settings == null) {
        return defaultValue
      }
      else {
        try {
          let keys = path.split('.')
          let obj = settings
          for (let key of keys) {
            if (typeof obj[key] != 'undefined') {
              obj = obj[key]
            }
            else {
              return defaultValue
            }
          }
          return obj
        }
        catch (e) {
          return defaultValue
        }
      }
    },

    setSettings: function (path, value) {
      let settings = this.loadSettings()
      let keys = path.split('.')
      let obj = {}
      let cur_obj = obj
      for (let i=0; i<keys.length-1; i++) {
        cur_obj[keys[i]] = {}
        cur_obj = cur_obj[keys[i]]
      }
      cur_obj[keys[keys.length-1]] = value
      settings = Object.assign(settings, obj)
      this.saveSettings(settings)
    },

  }
})
