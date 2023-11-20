var crud = {
  data : function () {
    return {
      data: this.data,
      instance: this.instance,
      instance_url: this.instance_url
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
          callbackError({'errors':[error]})
        }
      }
      finally {
      }
    },
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
    read_back: function (row, callbackOK, callbackError) {
      let url = this.instance_url
      if (row) {
        if (this.pk)
            url += row[this.pk].toString() + '/'
        else
            url += row.id.toString() + '/'
      }
      let options = {
        method: 'GET',
      }
      this.fetch_execute(url, options, callbackOK, callbackError)
    },
    update_back: async function (row, callbackOK, callbackError) {
      url = this.instance_url
      if (this.pk)
            url += row[this.pk].toString() + '/'
      else
         url += row.id.toString() + '/'
      let options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(row)
      }
      this.fetch_execute(url, options, callbackOK, callbackError)
    },
    delete_back: async function (row, callbackOK, callbackError) {
      let url = this.instance_url + row.id.toString() + '/'
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

var crud_front = {
    methods: {
        create_front: function (row) {
            this.create_back(row, ()=> {
              this.read_front() // Reloads all data after creating one record... Not so good idea. But...
              app.notify({type: 'success', message: 'Успішно створено!'})  //Created successfully
            },
            (response)=> {
              this.show_error(response.errors)
            })
          },

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
                }
              }
            },
            (response)=> {
              this.show_error(response.errors)
            })
          },

          update_front: function (row) {
            this.update_back(row, ()=> {
                this.read_front(row)
                app.notify({type: 'success', message: 'Успішно збережено !'}) //Saved successfully
            },
            (response)=> {
              this.show_error(response.errors)
            })
          },
          delete_front: function (row) {
            app.confirm('Delete ?').then(()=> {
              this.delete_back(row, ()=> {
                this.data.splice(this.data.indexOf(row), 1)
                app.notify({type: 'success', message: 'Успішно видалено !'})  //Deleted successfully
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

/* new */
var crud_ext = {
  data : function () {
    return {
      ext_data: this.ext_data
    }
  },
  computed: {
    form_fields: function () {
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
      // Это при постраничке с сервера
      //return Math.ceil(this.data_rows_count/this.perpage)

      // Это при локальной постраничке
      return Math.ceil(this.filteredRows.length/this.perpage)

    },
    paginator_page() {
      let page = app.getRouteParam('page')
      if (typeof page != 'undefined') {
        return parseInt(page)
      }
      else {
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
        //return JSON.parse(this.getRouteParam('prm'))
        return JSON.parse(atob(this.getRouteParam('prm')))
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
      //return JSON.stringify(obj)
      return btoa(JSON.stringify(obj))
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
      if (this.prm) {
        this.instance_paginator['paginator'] = this.prm['paginator']
        this.instance_order['order'] = this.prm['order']
        this.instance_search['search'] = this.prm['search']

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
        searchArray.push({'field': field.name, 'value': this.search, 'operator': 'LIKE'})
      }
      this.instance_search = {"search":searchArray}
      this.instance_paginator['paginator']['page'] = 1
      this.applayNewPrm()
    },

    selectRow: function(row) {
        this.current_row = row
    },
    addRow: function() {
      app.navigate('/'+ this.instance + '/0')
    },
    editRow: function(row) {
      app.navigate('/'+ this.instance +'/' + row.id)
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
