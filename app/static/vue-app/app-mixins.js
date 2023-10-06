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
        url += row.id.toString() + '/'
      }
      let options = {
        method: 'GET',
      }
      this.fetch_execute(url, options, callbackOK, callbackError)
    },
    update_back: async function (row, callbackOK, callbackError) {
      let url = this.instance_url + row.id.toString() + '/'
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
              app.notify({type: 'success', message: 'Created successfully'})
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
                app.notify({type: 'success', message: 'Saved successfully'})
            },
            (response)=> {
              this.show_error(response.errors)
            })
          },
          delete_front: function (row) {
            app.confirm('Delete ?').then(()=> {
              this.delete_back(row, ()=> {
                this.data.splice(this.data.indexOf(row), 1)
                app.notify({type: 'success', message: 'Deleted successfully'})
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


var table = {
  props: ['rows', 'id', 'perpage', 'sumfields', 'pagestore'],
  data: function () {
    return {
      currentPage: 1,
      search: '',
      searchField: '',
      orderField: '',
      orderFieldType: '',
      orderReverse: false,
    }
  },
  computed: {
    pages () {
      if (typeof this.filteredRows == 'undefined') {
        return 0
      }
      else {
        return Math.ceil(this.filteredRows.length / this.perpage)
      }
    },

    filteredRows() {
      if (this.search == '')
        return this.sortedRows

      let rows = []
      let found = false
      let search = this.search.toLowerCase()
      for (let row of this.sortedRows) {
        found = false
        for (let col in row) {
          if (this.searchField == '' || this.searchField == col) {
            try {
              found = found || (row[col].toString().toLowerCase().search(search) > -1)
            }
            catch (e) {
            }
          }
        }
        if (found)
        rows.push(row)
      }
      return rows
    },

    sortedRows () {
      if (this.orderField == '')
        return this.rows

      let rows = this.rows.slice()
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
          // if currentPagge more then pages (heppens when delete records)
          let pages = this.pages

          if ((this.currentPage > pages) && (pages > 0)) {
            this.setPage(pages)
          }
          if (this.currentPage < 1) {
            this.setPage(1)
          }
          if (typeof this.currentPage == 'undefined') {
            this.currentPage = 1
          }
          var rowStart = (this.currentPage - 1) * this.perpage
          if (rowStart >= paginatedRows.length) {
            rowStart = 0
          }
          var rowEnd = this.currentPage * this.perpage
          paginatedRows = paginatedRows.slice(rowStart, rowEnd)
        }
        return paginatedRows
      }
    },

    sum () {
      let sumlist = this.sumfields.split(' ')
      // Init Sum
      let result = {}
      for (let i=0; i<sumlist.length; i++) {
        result[sumlist[i]] = 0
      }
      // Calclate sum
      for (let row of this.rows) {
        for (let i=0; i<sumlist.length; i++) {
          if (row[sumlist[i]] != null) {
            if (!isNaN(row[sumlist[i]])) {
              result[sumlist[i]] = result[sumlist[i]] + parseFloat(row[sumlist[i]])
            }
          }
          else {
            this.$set(row, sumlist[i], 0)
          }
        }
      }
      return result
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
    setOrder: function (field, type='string', reverse=false) {
      this.orderField = field
      this.orderFieldType = type
      this.orderReverse = reverse
    },
    unsetOrder: function () {
      this.orderField = ''
      this.orderFieldType = 'string'
      this.orderReverse = false
    },
    setPage: function (page) {
      this.currentPage = page

      if (typeof this.pagestore != 'undefined') {
        let obj = {}
        obj[this.pagestore] = page
        store.commit('tablePage', obj)
      }
    },
    setNextPage: function () {
      if (this.currentPage < this.pages) {
        this.setPage(this.currentPage + 1)
      }
    },
    setPrevPage: function () {
      if (this.currentPage > 1) {
        this.setPage(this.currentPage - 1)
      }
    },
    setFilter: function (filter) {
      if (filter) {
        this.search = filter.search
        this.searchField = filter.field
      }
      else {
        this.search = ''
        this.searchField = ''
      }
    }
  },
  mounted: function () {
    if (typeof this.pagestore != 'undefined') {
      if (typeof store.state.tablePage[this.pagestore] != 'undefined') {
        this.setPage(store.state.tablePage[this.pagestore])
      }
    }
  }
}
