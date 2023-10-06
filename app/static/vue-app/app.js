"use strict";


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
   /* Інформація */
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

   /* Довідники */

  /* { path: '/client_old', component: { template: '<standard-page instance="client" title="Client" />' } }, */
  { path: '/client',
    component: { template: '<client v-if="router.app.componentsReady(`client`)" />' },
    beforeEnter (to, from, next) { loadComponents("client.js"); next() }
  },
  { path: '/client/:id',
    component: { template: '<client-edit v-if="router.app.componentsReady(`client-edit`)" />' },
    beforeEnter (to, from, next) { loadComponents("client.js"); next() }
  },
  { path: '/item',
    component: { template: '<item v-if="router.app.componentsReady(`item`)" />' },
    beforeEnter (to, from, next) { loadComponents("item.js"); next() }
  },


   /* Документи */
  { path: '/seller', component: { template: '<standard-page instance="seller" title="Seller" />' } },
]

const router = new VueRouter({routes})
const urlHash = '#'

const appDataset = {
  'menu':{
    'instance': 'menu',
    'url': 'http://localhost:5000/menu/',
  },

  /* ---  Контрагенти --- */
  'client': {
    'instance': 'client',
    'url': 'http://localhost:5000/client/',
    'fields': {
      'table': [
        {name:'id', 'title': 'Код', type:'integer', sort: true},
        {name:'customer_name', 'title': 'Повна назва', type:'string', sort: true},
      ],
      'form': [
        {name:'customer_name', 'title': 'Повна назва', type:'string', placeholder: 'Внесіть повну назву кліента', maxlength: 70, required: true},
        {name:'customer_address', 'title': 'Адреса клієнта', type:'string', placeholder: 'Внесить адресу кліента', maxlength: 100, required: true},
        {name:'phone', 'title': 'Контактний телефонPhone', type:'string', pattern: '\\(0\\d{2}\\)\\d{3}-\\d{2}-\\d{2}', placeholder: '(000)999-99-99'},
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


  /* ---  Товари та послуги --- */
  'item': {
    'instance': 'item',
    'url': 'http://localhost:5000/item/',
    'fields': {
      'table': [
        {name:'id', 'title': 'Код', type:'number', sort: true},
        {name:'item_name', 'title': 'Назва', type:'string', sort: true},
        {name:'unit', 'title': 'Одиниця виміру', type:'string', sort: false},
        {name:'service', 'title': 'Послуга', type:'boolean', sort: true},
      ],
      'form': [
        {name:'id', 'title': 'Код', type:'number', readonly:true},
        {name:'item_name', 'title': 'Назва товару (послуги)', type:'string', maxlength: 50, required:true},
        {name:'unit', 'title': 'Одиниця виміру', type:'select',
              items:[{"value": "шт.", "caption": "штука"},
                     {"value": "ящ.", "caption": "ящик"},
                     {"value": "уп.", "caption": "упаковка"},
                     {"value": "пар.","caption": "пара"}]
         },
        {name:'service', 'title': 'Послуга', type:'checkbox'},
        {name:'item_name', 'title': 'Опис товару (послуги)', type:'string', maxlength: 150, required:false}
      ]
    }
  },


  'seller': {
    'instance': 'seller',
    'url': 'http://localhost:5000/seller/',
    'fields': {
      'table': [
        {name:'name', 'title': 'Name', type:'string', sort: true},
        {name:'phone', 'title': 'Phone', type:'string', sort: true},
        {name:'email', 'title': 'E-mail', type:'string', sort: true}
      ],
      'form': [
        {name:'name', 'title': 'Name', type:'string'},
        {name:'phone', 'title': 'Phone', type:'string'},
        {name:'email', 'title': 'E-mail', type:'string'}
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
        'yes': 'Yes',
        'no': 'No',
        'cancel': 'Cancel'
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
        yesText: 'OK',
        cancelText: 'Cancel',
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
