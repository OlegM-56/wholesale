// ===========  BACK  CRUD ==================
var crud = {
  data : function () {
    return {
      data: this.data,
      instance: this.instance,
      instance_url: this.instance_url,

      instance_search: this.instance_search,
      instance_order: this.instance_order,
      instance_paginator: this.instance_paginator,
//      instance_detail: this.instance_detail,
      data_rows_count: this.data_rows_count
    }
  },
  methods: {
    fetch_execute: async function (url, options, callbackOK, callbackError) {
      try {
        let response = await fetch(url, options)
        let result = await response.json()
        if (typeof result.errors == 'undefined') {
          if (callbackOK) {
            callbackOK(result)
          }
        }
        else {
          if (callbackError) {
            callbackError(result)
          }
        }
      }
      catch (error) {
        if (callbackError) {
          callbackError({ 'errors': [`${error.name}: ${error.message}`] });
        }
      }
      finally {
      }
    },
         // ---------- CREATE -----
    create_back: function (row, callbackOK, callbackError) {
      let url = this.instance_url
      let options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(row)
      }
      this.fetch_execute(url, options, callbackOK, callbackError)
    },

        // ---------- READ -----
    read_back: function (row, callbackOK, callbackError) {
      let url = this.instance_url
      if (row) {
        url += this.ID + '/'  //row.id.toString() + '/'
      } else {
        url += '00/'
      }
      // -- додаємо параметри в запит до backend
      let data = {}
      if (typeof this.instance_search != 'undefined'){
        Object.assign(data, this.instance_search)
      }
      if (typeof this.instance_order != 'undefined'){
        Object.assign(data, this.instance_order)
      }
      if (typeof this.instance_paginator != 'undefined'){
        Object.assign(data, this.instance_paginator)
      }
      if (typeof this.instance_params != 'undefined'){
        Object.assign(data, this.instance_params)
      }
      let params = JSON.stringify(data)
      if (params != '{}') {
        url += params
      }
///
      let options = {
        method: 'GET',
      }
      this.fetch_execute(url, options, callbackOK, callbackError)
    },

        // ---------- update -----
    update_back: async function (row, callbackOK, callbackError) {
      let url = this.instance_url
      url += this.ID + '/'
      let options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(row)
      }
      this.fetch_execute(url, options, callbackOK, callbackError)
    },

        // ---------- Проведення накладної -----
    confirm_back: async function (row, callbackOK, callbackError) {
      let url = this.instance_url
      url += this.ID + '/'
      let options = {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(row)
      }
      this.fetch_execute(url, options, callbackOK, callbackError)
    },

        // ---------- delete -----
    delete_back: async function (row, url_detail, callbackOK, callbackError) {
      let url = (url_detail) ? url_detail : this.instance_url
      url += this.name_id ? row[this.name_id] : row.id + '/'
      let options = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        }
      }
      this.fetch_execute(url, options, callbackOK, callbackError)
    }
  }
}

// ===========  FRONT  CRUD ==================
var crud_front = {
    methods: {
         // ---------- CREATE -----
        create_front: function (row) {
            this.create_back(row, (response)=> {
              this.data = response
              this.read_front() // Reloads all data after creating one record... Not so good idea. But...
              app.notify({type: 'success', message: 'Успішно створено!'})
            },
            (response)=> {
              this.show_error(response.errors)
            })
          },

         // ---------- READ -----
          read_front: function (row) {
            this.read_back(row, (response)=> {
              if ('errors' in response) {
                this.show_error(response.errors)
              }
              else {
                if (row) {
                  // update one row
                  for (key in response) {
                    row[key] = response[key]
                  }
                }
                else {
                  // update data
                  this.data = response

                  // -- загальна кількість рядків
                  // get _total_records_ and Remove record with _total_records_ from data
                  this.data_rows_count = this.data.length
                  if (typeof this.data[this.data.length-1]['_total_records_'] != 'undefined') {
                    this.data_rows_count = this.data[this.data.length-1]['_total_records_']
                    this.data = this.data.slice(0, this.data.length-1)
                  }
                  /////////
                }
              }
            },
            (response)=> {
              this.show_error(response.errors)
            })
          },

         // ---------- UPDATE -----
          update_front: function (row) {
            this.update_back(row, ()=> {
                this.read_front(row)
                app.notify({type: 'success', message: 'Успішно збережено !'})
            },
            (errors)=> {
              this.show_error(errors.errors)
            })
          },

         // ---------- DELETE -----
          delete_front: function (row) {
            app.confirm('Видалити запис ?').then(()=> {
              this.delete_back(row, '', ()=> {
                this.data.splice(this.data.indexOf(row), 1)
                app.notify({type: 'success', message: 'Успішно видалено !'})
              },
              (response)=> {
                this.show_error(response.errors)
              });
            }).catch( function () {
            })
          },
          show_error: function(errors) {
            let message = errors.join('<br>')
            app.alert(message, '<i class="fas fa-times-circle text-danger"></i> Error')
          }
    }
}

// ===========  FRONT  EXT ==================
var crud_ext = {
  data : function () {
    return {
      ext_data: this.ext_data
    }
  },
  computed: {
    form_fields: function () {
      //  форми
      let fields = appDataset[this.instance]['fields']['form']
      for (field of fields) {
        // Prepare @select fields
        if (field['type'] == 'select') {
          field.items = []
          if (field['dataset']) {
            if (field['dataset']['src']) {
              if (this.ext_data[field['dataset']['src']]) {
                let src = this.ext_data[field['dataset']['src']]
                for (item of src) {
                  field.items.push({value: item[field['dataset']['value']], caption: item[field['dataset']['caption']]})
                }
              }
            }
          }
        }
      }
      return fields
    }
  },
  mounted: function() {
    this.ext_data = []
  },
  methods: {
    load_ext_data: function() {
      let fields = appDataset[this.instance]['fields']['form']
      for (field of fields) {
        if (field.dataset) {
          if (field.dataset.src) {
            this.read_ext_data(field.dataset.src)
          }
        }
      }
    },
    read_ext_data: function(instance) {
      let url = appDataset[instance]['url']
      let options = {method: 'GET'}
      this.fetch_execute(url, options,
        (response)=>{
          this.$set(this.ext_data, instance, response)
        },
        (response)=>{
          this.show_error(response.errors)
        }
      )
    }
  }
}

// ===========  FRONT  DETAIL ==================
var crud_detail = {
  data : function () {
    return {
      detail_data: this.detail_data
    }
  },
  computed: {
  },
  mounted: function() {
    this.detail_data = []
  },
  methods: {
      // --- завантаження даних по рядкам накладної
    load_detail_data: function(row) {
       //  модель рядків
       let instance_detail = appDataset[this.instance]['instance_detail']
       //  поля для таблиці рядків
       this.detail_fields = appDataset[instance_detail]['fields']['table']
       //   якщо існує накладна
       if ( row.id > 0 ) {
          //  запит даних
          let field_main_id = appDataset[instance_detail]['main_id']  //  поле заголовка накладної
          let url = appDataset[instance_detail]['url'] + '00/{"detail":{"field":"'+ field_main_id +'","value":' + row.id.toString()+ '}'
          if (appDataset[instance_detail]['order'])  url += ',"order":'+appDataset[instance_detail]['order']
          url += '}'
          let options = {method: 'GET'}
          this.fetch_execute(url, options,
             (result) => {
                if (result) {
                  this.detail_data = result
                  this.detail_data = this.detail_data.slice(0, this.detail_data.length-1)
                } else {
                  console.error('Invalid response:', response);
                }
            },
            (response) => {
              this.show_error(response.errors)
            }
          )
       }
    },
    // ---------- Видалення рядка накладної -----
    delete_detail_data: function (row) {
        app.confirm('Видалити рядок ?').then(()=> {
          url_detail = appDataset[this.instance_detail]['url']
          this.delete_back(row, url_detail, ()=> {
            this.detail_data.splice(this.detail_data.indexOf(row), 1)
            app.notify({type: 'success', message: 'Рядок успішно видалено !'})
          },
          (response)=> {
            this.show_error(response.errors)
          });
        }).catch( function () {
        })
      },

  }
}

// ===========  PAGINATOR LOCAL ==================
var paginator_local = {
  data: function () {
    return {
      perpage: this.perpage,
      orderField: '',
      orderFieldType: '',
      orderReverse: false,
      search: this.search,
      current_row: this.current_row
    }
  },
  computed: {
    paginator_pages() {
      return Math.ceil(this.filteredRows.length/this.perpage)
    },
    paginator_page() {
      //  якщо сторінка задана явно
      if (typeof this.page != 'undefined') {
        return this.page
      }
      //  перший запруск
      else {
        this.page = 1
        return 1
      }
    },

    filteredRows() {
      if (typeof this.search == 'undefined') {
        return this.sortedRows
      }
      else {
        if (this.search == '') {
          return this.sortedRows
        }
        else {
          let rows = []
          let found = false
          let search = this.search.toLowerCase()

          for (let row of this.sortedRows) {
            found = false
            for (let col in row) {
              //if (this.searchField == '' || this.searchField == col) {
                try {
                  found = found || (row[col].toString().toLowerCase().search(search) > -1)
                }
                catch (e) {
                }
              //}
            }
            if (found)
            rows.push(row)
          }
          return rows
        }
      }
    },

    sortedRows () {
      if (this.orderField == '')
        return this.data

      let rows = this.data.slice()
      rows = rows.sort((x, y) => {
        function compare (x, y, type) {
            function cook (d, type) {
              switch(type) {
                case 'number':
                  d = parseFloat(d)
                  break
                case 'float':
                  d = parseFloat(d)
                  break
                case 'date':
                  if (d.indexOf('.') == -1) {
                    d = new Date(d)
                  }
                  else {
                    if (d.indexOf(':') == -1) {
                      let DMY = d.split('.')
                      d = new Date(parseInt(DMY[2]), parseInt(DMY[1])-1, parseInt(DMY[0]), 0, 0, 0)
                    }
                  }
                  break
                case 'datetime':
                  if ( (d.indexOf(':') != -1) && (d.indexOf('.') != -1) ) {
                    let DT = d.split(' ')
                    let HMS = DT[0].split(':')
                    let DMY = DT[1].split('.')
                    d = new Date(parseInt(DMY[2]), parseInt(DMY[1])-1, parseInt(DMY[0]), parseInt(HMS[0]), parseInt(HMS[1]), parseInt(HMS[2]))
                  }
                  break

                default:
                  try {
                    d = d.toString().toLowerCase()
                  }
                  catch (err) {
                    d = ''
                  }
              }
              return d
            }
            x = cook(x, type)
            y = cook(y, type)
            return (x < y ? -1 : (x > y ? 1 : 0))
        }

        function compareStrings(str1, str2) {
          if ((str1 == null) || (str1 == '' ) ) str1 = ' '
          if ((str2 == null) || (str2 == '' ) ) str2 = ' '
          try {
            let rx = /([^\d]+|\d+)/ig
            let str1split = str1.match(rx)
            let str2split = str2.match(rx)
            for (let i = 0, l = Math.min(str1split.length, str2split.length); i < l; i++) {
              let s1 = str1split[i], s2 = str2split[i]
                if (s1 === s2) continue
                if (isNaN(+s1) || isNaN(+s2))
                    return s1 > s2 ? 1 : -1
                else
                    return +s1 - s2
            }
          }
          catch(err) {
            return 0
          }
          return 0
        }

        let xvalue = x[this.orderField]
        let yvalue = y[this.orderField]
        if (this.orderFieldType == 'string') {
          return compareStrings(xvalue, yvalue) * (this.orderReverse == true ? -1 : 1)
        }
        else {
          return compare(xvalue, yvalue, this.orderFieldType) * (this.orderReverse == true ? -1 : 1)
        }

      })

      return rows
    },

    paginatedRows () {
      if (typeof this.filteredRows == 'undefined') {
        return []
      }
      else {
        let paginatedRows = this.filteredRows
        if (this.perpage) {
          let rowStart = (this.paginator_page - 1) * this.perpage
          if (rowStart >= paginatedRows.length) {
            rowStart = 0
          }
          let rowEnd = this.paginator_page * this.perpage
          paginatedRows = paginatedRows.slice(rowStart, rowEnd)
        }
        return paginatedRows
      }
    },

    fields: function () {
      return appDataset[this.instance]['fields']['table']
    },
    sortFields: function () {
      let fields = []
      for (field of this.fields) {
          if ( (typeof field.sort !== 'undefined') && (typeof field.name !== 'undefined') && (typeof field.title !== 'undefined') && (typeof field.type !== 'undefined') ){
              fields.push({field:field.name, caption:field.title, type:field.type})
          }
      }
      return fields
    }
  },

  methods: {
    order: function (field, type='string') {
      if (this.orderField === field) {
        if (this.orderReverse) {
          // disable order
          this.orderField = ''
        }
        else {
          this.orderReverse = true
        }
      }
      else {
        this.orderField = field
        this.orderFieldType = type
        this.orderReverse = false
      }
    },
  }

}

// ===========  PAGINATOR SERVER ==================
var paginator_server = {
  data: function () {
    return {
      orderField: this.orderField,
      orderReverse: this.orderReverse,
      search: this.search,
      current_row: this.current_row
    }
  },

  computed: {
    prm: function() {
      try {
         return JSON.parse(decodeURIComponent(atob(this.getRouteParam('prm'))))
           //         return JSON.parse(this.getRouteParam('prm'))
            // return JSON.parse(atob(this.getRouteParam('prm')))
      }
      catch (e) {
        return null
      }
    },
    prm_new: function() {
      let obj = {}
      obj['paginator'] = this.instance_paginator['paginator']
      obj['order'] = this.instance_order['order']
      obj['search'] = this.instance_search['search']
      obj['detail'] = this.instance_detail['detail']
      return btoa(encodeURIComponent(JSON.stringify(obj)))
            //      return JSON.stringify(obj)
            //      return btoa(JSON.stringify(obj))
    },
    param_instance() {
      return this.getRouteParam('instance')
    },

    fields: function () {
      return appDataset[this.instance]['fields']['table']
    },
    sortFields: function () {
      let fields = []
      for (field of this.fields) {
          if ( (typeof field.sort !== 'undefined') && (typeof field.name !== 'undefined') && (typeof field.title !== 'undefined') && (typeof field.type !== 'undefined') ){
              fields.push({field:field.name, caption:field.title, type:field.type})
          }
      }
      return fields
    },
    paginator_pages() {
      return Math.ceil(this.data_rows_count/this.perpage)
    },
    paginator_page() {
      try {
        let page = this.prm['paginator']['page']
        return parseInt(page)
      }
      catch (e) {
        return 1
      }
    },
    //   назва поля первинного ключа Моделі
    name_id: function () {
        if (appDataset[this.instance]['pk'])
            return appDataset[this.instance]['pk']
        else
            return 'id'
    }

  },

  mounted: function() {
    this.orderField = ''
    this.orderReverse = false
    this.search = ''
    this.init()
  },

  methods: {
    init: function() {
      this.instance = this.param_instance
      store.commit('title', appDataset[this.instance]['title'])
      this.instance_url = appDataset[this.instance]['url']
      if (appDataset[this.instance]['perpage']) {
        this.perpage = appDataset[this.instance]['perpage']
      }

      this.instance_paginator = {'paginator':{'page':1, 'limit':this.perpage}}
      this.instance_order = {}
      this.instance_search = {}
      this.instance_detail = {}
      if (this.prm) {
        this.instance_paginator['paginator'] = this.prm['paginator']
        this.instance_order['order'] = this.prm['order']
        this.instance_search['search'] = this.prm['search']
        this.instance_detail['detail'] = this.prm['detail']

        if (this.prm['order']) {
          if (this.prm['order'].length > 0) {
            let order_prm = this.prm['order'][0].split(' ')
            this.orderField = order_prm[0]
            this.orderReverse = (order_prm.length > 1)
          }
        }

        if (this.prm['search']) {
          for (item of this.prm['search']) {
            let keys = Object.keys(item)
            if (keys.length > 0) {
              this.search = item['value']
            }
            break;
          }
        }

      }

      this.read_front()

      if (this.datasets) {
        this.datasets_array = []
        for (ext_data of this.datasets) {
          this.read_ext_data(ext_data)
          this.datasets_array.push(ext_data)
        }
      }
    },

    applayNewPrm: function () {
      app.navigate('/'+ this.instance + '/prm/' + this.prm_new)
    },
    order: function (field) {
      if (this.orderField === field) {
        if (this.orderReverse) {
          // disable order
          this.orderField = ''
        }
        else {
          this.orderReverse = true
        }
      }
      else {
        this.orderField = field
        //this.orderFieldType = type
        this.orderReverse = false
      }

      if (this.orderField == '') {
        this.instance_order = {}
      }
      else {
        this.instance_order = {"order": [this.orderField + (this.orderReverse==true?" desc":"")]}
      }
      this.applayNewPrm()
    },

    searchApply: function (searchText) {
      this.search = searchText
      let searchArray = []
      for (let field of this.fields) {
        searchArray.push({'field': field.name, 'value': this.search})
        // searchArray.push({'field': field.name, 'value': this.search, 'operator': 'LIKE'})
      }
      this.instance_search = {"search":searchArray}
      this.instance_paginator['paginator']['page'] = 1
      this.applayNewPrm()
    },

    selectRow: function(row) {
        this.current_row = row
    },
    addRow: function() {
      if (this.instance.includes('invoice'))
        app.navigate('/invoice/'+ this.instance +'/0')
      else
        app.navigate('/'+ this.instance + '/0')
    },
    editRow: function(row) {
      if (this.instance.includes('invoice'))
        app.navigate('/invoice/'+ this.instance +'/' + row[this.name_id])
      else
        app.navigate('/'+ this.instance +'/' + row[this.name_id])
    },
    setPage: function(page) {
      this.instance_paginator['paginator']['page'] = page
      this.applayNewPrm()
    },
    setPrevPage: function() {
      this.setPage(this.paginator_page -1)
    },
    setNextPage: function() {
      this.setPage(this.paginator_page +1)
    },
    getRouteParam: function (name) {
      return this.$route.params[name]
    },
  },
  watch: {
    prm() {
      this.init()
    },
    param_instance() {
      this.init()
    },
  }
}

// ===========  EDIT BLANK ==================
var edit = {
  computed: {
    instance_name() {
      return this.getRouteParam('instance')
    },
    ID: function () {
      return this.getRouteParam('id')
    },
    //  id головної таблиці
    main_id: function () {
      return this.getRouteParam('main_id')
    },
    //  max номер пп рядка накладної для вводу нового рядка
    max_npp: function () {
      return this.getRouteParam('max_npp')
    },
  },
  mounted: function() {
    this.init()
  },
  methods: {
    init: function () {
      this.instance = this.instance_name
      store.commit('title', appDataset[this.instance]['title'])
      this.instance_url = appDataset[this.instance]['url']
      this.field_main_id = appDataset[this.instance]['main_id']

      let row = {id: this.ID}
      this.data = {}
      if ( row.id == 0 ) {
        // якщо задано id головної таблиці
        if (this.main_id) {
            this.data[this.field_main_id] = this.main_id;
            this.data.npp = this.max_npp
        }
      } else {
          this.read_back(row, (response)=> {
              this.data = response
            },
            (response) => {
              this.show_error(response.errors)
            }
          );
      }
      this.load_ext_data()
    },
    doAction: function ($event) {
      if ($event.action.name == 'submit') {
        if ($event.valid == true) {
          if (this.ID == 0) {
            this.create_back(this.data, ()=> {
              app.notify({type: 'success', message: 'Запис створено'})
              this.$router.go(-1)
            }, (errors)=> {
              this.show_error(errors.errors)
            })
          }
          else {
            this.update_back(this.data, ()=> {
              app.notify({type: 'success', message: 'Зміни збережено'})
              this.$router.go(-1)
            }, (errors)=> {
              this.show_error(errors.errors)
            })
          }
        }
        else {
          app.alert('Фарма заповнена невірно! Перевірте!', '<i class="fas fa-times-circle text-danger"></i> Error')
        }
      }
      if ($event.action.name == 'cancel') {
        this.$router.go(-1)
      }
    },
    show_error: function(errors) {
      let message = errors.join('<br>')
      app.alert(message, '<i class="fas fa-times-circle text-danger"></i> Error')
    },

    getRouteParam: function (name) {
      return this.$route.params[name]
    },
  },
  watch: {
    ID() {
      this.init()
    },
    instance_name() {
      this.data = null
      this.init()
    }
  }
}

// ===========  EDIT BLANK INVOICE==================
var edit_invoce = {
  data: function () {
    return {
      current_row: this.current_row
    }
  },
  computed: {
    instance_name() {
      return this.getRouteParam('instance')
    },
    ID: function () {
      return this.getRouteParam('id')
    },
    // --  статус документу:  true - накладна проведена
    confirmed: function () {
      return this.data.doc_status==1
    },
    // --  доступ до редагування накладної:  якщо проведено - не можна редагувати
    isEdit: function () {
      return !this.confirmed
    },
    editRowActions() {
      // Повертаємо масив дій для режиму редагування рядків
      return [
        { name: 'edit', caption: '', title: 'Змінити', action: 'edit', class: 'fas fa-edit text-primary fa-icon-900' },
        { name: 'delete', caption: '', title: 'Видалити', action: 'delete', class: 'fas fa-eraser text-danger fa-icon-900' }
      ];
    },
    invoceActions() {
      // Повертаємо масив дій для заголовку документу
      //  для складського ордеру
      if ( this.instance.includes('wh_order') ) {
        arActions =[
          {name:'cancel', title:'Повернутися до накладної', action: 'Cancel', class: ''}
        ]
      } else {
        //  для накладних
        arActions =[
          {name:'submit', title:'Зберегти', action: 'Save', class: '', dafault:true, disabled: this.confirmed},
          {name:'cancel', title:'Cancel', action: 'Cancel', class: ''},
          {name:'confirm', title: this.confirmed ? 'Скасувати проведення' : 'Провести документ', action: 'confirm', class: ''}
        ];
        //  якщо є складський ордер
        if (this.instance_wh_order) arActions.push( {name:'wh_order', title:'Складський ордер', action:'wh_order', class: '', disabled: !this.confirmed} )
      }
      return arActions
    },
    formReadonlyFields() {
        // --  набір полів для форми без можливості редагування
        return appDataset[this.instance]['fields']['form_readonly'];
    }

  },
  mounted: function() {
    this.init()
  },
  methods: {
    //  --- INIT -----
    init: function () {
      this.instance = this.instance_name
      this.instance_detail = appDataset[this.instance]['instance_detail']
      this.instance_wh_order = appDataset[this.instance]['instance_wh_order']
      this.instance_url = appDataset[this.instance]['url']
      this.pk = appDataset[this.instance]['pk']
      store.commit('title', appDataset[this.instance]['title'])
      // --- завантаження даних по накладній
      let row = {id: this.ID}
      this.data = {}
      //  якщо накладна існує
      if (row.id > 0) {
          this.read_back(row, (response)=> {
              this.data = response
            },
            (errors) => {
              this.show_error(errors.errors)
            }
          );
      }
      //  новий документ
      else {
          this.data.doc_status = 0
      }
      // --- завантаження даних для вибору в формі
      this.load_ext_data()
      // --- завантаження даних по рядкам накладної
      this.load_detail_data(row)
    },
     // -------- ОПЕРАЦІЇ -------------
    doAction: function ($event) {
      if ($event.action.name == 'submit') {
        if ($event.valid == true) {
          //  ----  створення накладної ---
          if (this.ID == 0) {
            this.create_back(this.data, (response)=> {
              app.notify({type: 'success', message: 'Документ створено'})
              this.$router.push('/invoice/'+ this.instance + '/' +response.num_doc);
            }, (errors)=> {
              this.show_error(errors)
            })
          }
          else {
            //  ----  коригування накладної ---
            this.update_back(this.data,
            (response)=> {
              this.data = response
              app.notify({type: 'success', message: 'Зміни в документі збережено'})
            },
            (errors)=> {
              this.show_error(errors.errors)
            })
            this.$router.push('/invoice/'+ this.instance + '/' +this.ID);
          }
        }
        else {
          app.alert('Form is NOT valid!', '<i class="fas fa-times-circle text-danger"></i> Error')
        }
      }
       //  --- Повернутися до списку без збереження змін
      if ($event.action.name == 'cancel') {
        this.$router.go(-1)
//        this.$router.push('/'+ this.instance)
      }
       //  --- Проведення накладної
      if ($event.action.name == 'confirm') {
        if  ( this.confirmed  ) {
          question = 'Скасувати проведення документу ?'
          notify_msg = 'Проведення скасовано'
        } else {
          question = 'Провести документ ?'
          notify_msg = 'Документ проведено'
        }
        app.confirm(question).then(()=> {
            this.confirm_back(this.data,
            (response)=> {
              this.data = response
              app.notify({type: 'success', message: notify_msg})
            },
            (errors)=> {
              this.show_error(errors.errors)
            })
            this.$router.push('/invoice/'+ this.instance + '/' +this.ID);
        }).catch( function () {
        })
      }
      // --- складський ордер для видаткових накладних
      if ($event.action.name == 'wh_order') {
        if (this.instance_wh_order) {
          app.navigate('/invoice/' + this.instance_wh_order + '/' + this.ID)
        }
      }
    },
    // --------- ПОМИЛКИ ------
    show_error: function(errors) {
      let message = errors.join('<br>')
      app.alert(message, '<i class="fas fa-times-circle text-danger"></i> Error')
    },
    // --- ПАРАМЕТРИ З РЯДКА РОУТЕРА ---
    getRouteParam: function (name) {
      return this.$route.params[name]
    },
    // --- ОПЕРАЦІЇ З РЯДКАМИ НАКЛАДНОЇ ---
    selectRowDetail: function(row) {
        this.current_row = row
    },
    addRowDetail: function() {
      // останній номер пп рядка накладної для вводу нового рядка
      let max_npp = 1
      if (this.detail_data.length > 0) {
          let max_row = this.detail_data.reduce((max, obj) => (obj.npp > max.npp) ? obj : max);
          max_npp = max_row.npp + 1
      }
      app.navigate('/'+ this.instance_detail + '/0/' + this.data.num_doc + '/' + max_npp )
    },
    editRowDetail: function(row) {
      app.navigate('/'+ this.instance_detail +'/' + row.id)
    },
    deleteRowDetail: function(row) {
        this.delete_detail_data(row)
    },

  },
  watch: {
    ID() {
      this.init()
    },
    instance_name() {
      this.data = null
      this.detail_data = null
      this.init()
    }
  }
}


// ===========  REPORT ==================
var report = {
  data: function () {
    return {
      current_row: this.current_row
    }
  },
  computed: {
    instance_name() {
      return this.getRouteParam('instance')
    },
  },
  mounted: function() {
    this.init()
  },
  methods: {
    init: function () {
      this.instance = this.instance_name
      store.commit('title', appDataset[this.instance]['title'])
      this.instance_url = appDataset[this.instance]['url']
      this.fields = appDataset[this.instance]['fields']['table']
      this.data = null
      this.perpage = appDataset[this.instance]['perpage']

    },
    doAction: function ($event) {
      if ($event.action.name == 'submit') {
        if ($event.valid == true) {
          // "params": {"date_rep":"2023-12-12"}
          let par_rep = {}
          Object.assign(par_rep, this.data_params)
          this.instance_params = {"params": par_rep}
          this.data = null
          this.read_front()
        }
        else {
          app.alert('Форма заповнена невірно! Перевірте!', '<i class="fas fa-times-circle text-danger"></i> Error')
        }
      }
      if ($event.action.name == 'cancel') {
        this.$router.go(-1)
      }
    },
    selectRow: function(row) {
        this.current_row = row
    },

    setPage: function(page) {
      this.page = page
    },
    setPrevPage: function() {
      this.setPage(this.paginator_page -1)
    },
    setNextPage: function() {
      this.setPage(this.paginator_page +1)
    },
    getRouteParam: function (name) {
      return this.$route.params[name]
    },



    show_error: function(errors) {
      let message = errors.join('<br>')
      app.alert(message, '<i class="fas fa-times-circle text-danger"></i> Error')
    },
    getRouteParam: function (name) {
      return this.$route.params[name]
    },
  },
  watch: {
    instance_name() {
      this.data = null
      this.init()
    },
        // Спостерігаємо за змінами this.fields і оновлюємо form_fields
    data_params: function(newData, oldData) {
      this.init()
    }

  }
}


// ===========  TABLE ==================
var table = {
  props:['rows', 'current_row', 'fields', 'orderField', 'orderReverse', 'search', 'actions'],
  methods: {
    doAction: function (action, row) {
      this.$emit(action.action, row)
    }
  },
  filters: {
    colorTheFound: function (value, search) {
      if (search) {
        return String(value).replace(new RegExp('('+search+')', 'ig'), '<span class="selected-text">$1</span>')
      }
      else {
        return value
      }
    }
  }
}
