"use strict";

const main_url = 'http://olmi254.pythonanywhere.com/'

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
  { path: '/database',
    component: { template: '<database v-if="router.app.componentsReady(`database`)" />' },
    beforeEnter (to, from, next) { loadComponents("info-pages.js"); next() }
  },
  { path: '/implementation',
    component: { template: '<implementation v-if="router.app.componentsReady(`implementation`)" />' },
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
    'perpage': 10,
    'fields': {
      'table': [
        {name:'id', 'title': 'Код', type:'integer', sort: true},
        {name:'customer_name', 'title': 'Повна назва', type:'string', sort: true},
      ],
      'form': [
        {name:'id', 'title': 'Код', type:'number', readonly:true},
        {name:'customer_name', 'title': 'Повна назва', type:'string', placeholder: 'Внесіть повну назву кліента', maxlength: 70, required: true},
        {name:'customer_address', 'title': 'Адреса клієнта', type:'string', placeholder: 'Внесить адресу кліента', maxlength: 100, required: true},
        {name:'phone', 'title': 'Контактний телефонPhone', type:'string', pattern: '\\(0\\d{2}\\)\\d{3}-\\d{2}-\\d{2}', placeholder: '(099)999-99-99'},
/*
        {name:'email', 'title': 'Email', type:'email', pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'},
        {name:'password', 'title': 'Password', type:'password'},
        {name:'photo', 'title': 'Photo', type:'file', accept:'image/*'},
        {name:'country', 'title': 'Country', type:'select', items:[{value:1, caption:'Ukraine'},{value:2, caption:'USA'},{value:3, caption:'Canada'}]},
        {name:'address', 'title': 'Address', type:'textarea'},
        {name:'birthday', 'title': 'Birthday', type:'date'},
        {name:'married', 'title': 'Married', type:'switch'},
        {name:'sex', 'title': 'Sex', type:'radio', items:[{value:1, caption:'male'},{value:2, caption:'female'},{value:3, caption:'undefined'}]},
        {name:'married', 'title': 'Married', type:'checkbox'},
        {name:'tags', 'title': 'Tags', type:'chips'},

        {name:'price', 'title': 'Price', type:'number', step: 0.01, min:0, required:true},
        {name:'warehouse', 'title': 'Warehouse', type:'autocomplete', items:[1,2], required:true},
*/
      ]
    }
  },

  /* --- Одиниці виміру --- */
  'unit': {
    'instance': 'unit',
    'url': main_url + 'unit/',
    'perpage': 5,
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
    'perpage': 10,
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
    'perpage': 15,
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
    'perpage': 10,
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


  /* ----- Поточні залишки по партіях ------------  */
  'balance_item': {
    'instance': 'balance_item',
    'url': main_url + 'balance_item/',
    'title': 'Поточні залишки по партіях',
    'pk': 'party_id',
    'perpage': 10,
    'fields': {
      'table': [
        {name:'party_id', 'title': 'Код партії', type:'number', sort:true},
        {name:'item_id', 'title': 'Код товару', type:'string', sort:true},
        {name:'item_name', 'title': 'Назва товару', type:'string', sort:true},
        {name:'date_receipt', 'title': 'Дата приходу', type:'mydate', sort:true},
        {name:'cost', 'title': 'Ціна закупки', type:'number', sort:true},
        {name:'unit', 'title': 'Одиниця виміру', type:'string'},
        {name:'quantity', 'title': 'Залишок', type:'number', sort:true},
      ],
      'form': [
        {name:'party_id', 'title': 'Код партії', type:'number', readonly:true},
        {name:'item_id', 'title': 'Код товару', type:'string', readonly:true},
        {name:'item_name', 'title': 'Назва товару', type:'string', readonly:true},
        {name:'date_receipt', 'title': 'Дата приходу', type:'mydate', readonly:true},
        {name:'cost', 'title': 'Ціна закупки', type:'number', readonly:true},
        {name:'unit', 'title': 'Одиниця виміру', type:'string', readonly:true},
        {name:'quantity', 'title': 'Залишок', type:'number', readonly:true},
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
    'perpage': 10,
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
    'perpage': 4,
    'main_id': 'pinvoice_id',
    'order': '["npp"]',
    'fields': {
      'table': [
        {name:'npp', 'title':'№ пп', type:'number'},
        {name:'item_id', 'title':'Код товару', type:'string'},
        {name:'item_name', 'title':'Назва товару', type:'string'},
        {name:'unit', 'title':'Одиниця виміру', type:'string'},
        {name:'quantity', 'title':'Кількість', type:'number'},
        {name:'price', 'title':'Ціна', type:'number'},
        {name:'amount', 'title':'Сума', type:'string', readonly:true},
      ],
      'form': [
        {name:'id', 'title':'Код рядка', type:'number', readonly:true},
        {name:'pinvoice_id', 'title':'Код накладної', type:'number', readonly:true},
        {name:'npp', 'title': '№ пп', type:'number', readonly:true},
        {name:'item_id', 'title':'Товар', type:'select', dataset:{src: 'item', value:'id', caption:'item_name'}, required:true},
        {name:'quantity', 'title':'Кількість', type:'number', min:0.001, step:0.001, required:true},
        {name:'price', 'title':'Ціна', type:'number', min:0.01, step:0.01, required:true},
        {name:'amount', 'title':'Сума', type:'string', readonly:true},
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
    'perpage': 10,
    'fields': {
      'table': [
        {name:'num_doc', 'title': 'Номер документу', type:'number', sort:true},
        {name:'customer_name', 'title': 'Отримувач', type:'string', sort:true},
        {name:'doc_date', 'title': 'Дата документу', type:'mydate', sort:true},
        {name:'doc_status_name', 'title': 'Статус', type:'string', sort:true},
        {name:'doc_date_approve', 'title': 'Дата проведення', type:'mydate', sort:true},
        {name:'sum_doc', 'title':'Сума по документу, грн.', type:'number'}

      ],
      'form': [
        {name:'num_doc', 'title': 'Номер документу', type:'number', readonly:true},
        {name:'customer_id', 'title': 'Отримувач', type:'select', dataset: {src: 'client', value: 'id', caption: 'customer_name'} },
        {name:'doc_date', 'title': 'Дата документу', type:'mydate', required:'required'},
        {name:'doc_status_name', 'title': 'Статус', type:'string', readonly:true},
      //  {name:'doc_status', 'title': 'Статус', type:'select', dataset: {src: 'status_doc', value: 'id', caption: 'name_status'} },
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
    'perpage': 4,
    'main_id': 'einvoice_id',
    'order': '["npp"]',
    'fields': {
      'table': [
        {name:'npp', 'title':'№ пп', type:'number'},
        {name:'item_id', 'title':'Код товару', type:'string'},
        {name:'item_name', 'title':'Назва товару', type:'string'},
        {name:'unit', 'title':'Одиниця виміру', type:'string'},
        {name:'quantity', 'title':'Кількість', type:'number'},
        {name:'price', 'title':'Ціна', type:'number'},
        {name:'amount', 'title':'Сума', type:'string'}
      ],
      'form': [
        {name:'id', 'title':'Код рядка', type:'number', readonly:true},
        {name:'einvoice_id', 'title':'Код накладної', type:'number', readonly:true},
        {name:'npp', 'title':'№ пп', type:'number', readonly:true},
        {name:'item_id', 'title':'Товар', type:'select', dataset: {src: 'item', value: 'id', caption: 'item_name'}, required:true, get_price:true},
        {name:'quantity', 'title':'Кількість', type:'number', required:true, min:0.001, step:0.001},
        {name:'price', 'title':'Ціна', type:'number', required:true, min:0.01, step:0.01},
        {name:'amount', 'title':'Сума', type:'string', readonly:true}
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
    'perpage': 10,
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
    'perpage': 10,
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
    'perpage': 10,
    'fields': {
      'table': [
        {name:'id', 'title':'Код товару', type:'number', sort:true},
        {name:'item_name', 'title': 'Назва товару', type:'string', sort:true},
        {name:'unit', 'title': 'Одиниця виміру', type:'string'},
        {name:'balance_item', 'title':'Залишок', type:'number', sort:true},
        {name:'balance_sum_item', 'title':'Залишок по цінам приходу, грн.', type:'string', sort:true},
        {name:'balance_pricesum_item', 'title':'Залишок по прайсовим цінам, грн.', type:'string', sort:true},
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
    'perpage': 5,
    'fields': {
      'table': [
        {name:'id', 'title':'Код товару', type:'number', sort:true},
        {name:'item_name', 'title': 'Назва товару', type:'string', sort:true},
        {name:'unit', 'title': 'Одиниця виміру', type:'string'},
        {name:'start_balance_item', 'title':'Початковий залишок', type:'number'},
        {name:'receipt_item', 'title':'Надходження', type:'number'},
        {name:'expense_item', 'title':'Витрата', type:'number'},
        {name:'balance_item', 'title':'Залишок', type:'number'}
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
    'perpage': 5,
    'fields': {
      'table': [
        {name:'id', 'title':'Код товару', type:'number', sort:true},
        {name:'item_name', 'title': 'Назва товару', type:'string', sort:true},
        {name:'unit', 'title': 'Одиниця виміру', type:'string'},
        {name:'sales_item', 'title':'Кількість', type:'number', sort:true},
        {name:'sales_money_item', 'title':'Сума продажу, грн.', type:'number', sort:true}
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
    'perpage': 15,
    'fields': {
      'table': [
        {name:'id', 'title':'Код товару', type:'number', sort:true},
        {name:'item_name', 'title': 'Назва товару', type:'string', sort:true},
        {name:'unit', 'title': 'Одиниця виміру', type:'string'},
        {name:'sales_item', 'title':'Кількість', type:'number', sort:true},
        {name:'sales_money_item', 'title':'Виручка від продажу, грн.', type:'number', sort:true},
        {name:'purchase_money_item', 'title':'Витрати на закупку, грн.', type:'number', sort:true},
        {name:'profit_item', 'title':'Сума прибуткуу, грн.', type:'number', sort:true}
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
    'perpage': 15,
    'fields': {
      'table': [
        {name:'id', 'title':'Код товару', type:'number'},
        {name:'item_name', 'title': 'Назва товару', type:'string'},
        {name:'amount_indicator', 'title':'Виручка від продажу, грн.', type:'string', 'title2': 'Прибуток від продажу, грн.'},
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
    'perpage': 15,
    'fields': {
      'table': [
        {name:'id', 'title':'Код групи', type:'number'},
        {name:'group_name', 'title': 'Назва групи', type:'string'},
        {name:'sales_money_group', 'title':'Сума продажу, грн.', type:'string'}
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
      //this.$material.locale.days = [app.translate("Sunday"),app.translate("Monday"),app.translate("Tuesday"),app.translate("Wednesday"),app.translate("Thursday"),app.translate("Friday"),app.translate("Saturday")]
      //this.$material.locale.shortDays = [app.translate("Sun"),app.translate("Mon"),app.translate("Tue"),app.translate("Wed"),app.translate("Thu"),app.translate("Fri"),app.translate("Sat")]
      //this.$material.locale.shorterDays = this.$material.locale.shortDays
      //this.$material.locale.months = [app.translate("January"),app.translate("February"),app.translate("March"),app.translate("April"),app.translate("May"),app.translate("June"),app.translate("July"),app.translate("August"),app.translate("September"),app.translate("October"),app.translate("November"),app.translate("December")]
      //this.$material.locale.shortMonths = [app.translate("Jan"),app.translate("Feb"),app.translate("Mar"),app.translate("Apr"),app.translate("May"),app.translate("June"),app.translate("July"),app.translate("Aug"),app.translate("Sept"),app.translate("Oct"),app.translate("Nov"),app.translate("Dec")]
      //this.$material.locale.shorterMonths = ["J","F","M","A","M","Ju","Ju","A","Se","O","N","D"]
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


/*
const routes = [
    Документи
  //  --- Залишки по партіях ---
  { path: '/balance-item',
    component: { template: '<balance-item v-if="router.app.componentsReady(`balance-item`)" />' },
    beforeEnter (to, from, next) { loadComponents("balance-item.js"); next() }
  },
  { path: '/balance-item/:party_id',
    component: { template: '<balance-item-edit v-if="router.app.componentsReady(`balance-item-edit`)" />' },
    beforeEnter (to, from, next) { loadComponents("balance-item.js"); next() }
  },
  //  --- Прибуткові накладні ---
  { path: '/pinvoice',
    component: { template: '<pinvoice v-if="router.app.componentsReady(`pinvoice`)" />' },
    beforeEnter (to, from, next) { loadComponents("pinvoice.js"); next() }
  },
  { path: '/pinvoice/:num_doc',
    component: { template: '<pinvoice-edit v-if="router.app.componentsReady(`pinvoice-edit`)" />' },
    beforeEnter (to, from, next) { loadComponents("pinvoice.js"); next() }
  },

    Довідники
  // { path: '/client_old', component: { template: '<standard-page instance="client" title="Client" />' } },
  //  --- Контрагенти ---
  { path: '/client',
    component: { template: '<client v-if="router.app.componentsReady(`client`)" />' },
    beforeEnter (to, from, next) { loadComponents("client.js"); next() }
  },
  { path: '/client/:id',
    component: { template: '<client-edit v-if="router.app.componentsReady(`client-edit`)" />' },
    beforeEnter (to, from, next) { loadComponents("client.js"); next() }
  },
  //  --- Товари та послуги ---
  { path: '/item',
    component: { template: '<item v-if="router.app.componentsReady(`item`)" />' },
    beforeEnter (to, from, next) { loadComponents("item.js"); next() }
  },
  { path: '/item/:id',
    component: { template: '<item-edit v-if="router.app.componentsReady(`item-edit`)" />' },
    beforeEnter (to, from, next) { loadComponents("item.js"); next() }
  },

    Інформація
  { path: '/',
    component: { template: '<main-page v-if="router.app.componentsReady(`main-page`)" />' },
    beforeEnter (to, from, next) { loadComponents("main-page.js"); next() }
  },
  { path: '/database',
    component: { template: '<database v-if="router.app.componentsReady(`database`)" />' },
    beforeEnter (to, from, next) { loadComponents("database.js"); next() }
  },
  { path: '/implementation',
    component: { template: '<implementation v-if="router.app.componentsReady(`implementation`)" />' },
    beforeEnter (to, from, next) { loadComponents("implementation.js"); next() }
  },
]


*/