Vue.component('v-style', {
  render: function (createElement) {
    return createElement('style', this.$slots.default)
  }
});

Vue.component('standard-table', {
  mixins: [table],
  props:['fields', 'actions', 'current_row'],
  computed: {
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
  template: `
<div>
  <table-menu @filter="search=$event"
    @order="order($event.field, $event.type)"
    :sorting="sortFields"
    :orderField="orderField"
    :orderReverse="orderReverse"
  />

  <u-table>
  <u-tr>
    <u-th v-for="field in fields">
        <template v-if="field.sort">
            <header-order :field="field.name" :orderField="orderField" :orderReverse="orderReverse" v-on:click="order($event, field.type)">{{field.title}}</header-order>
        </template>
        <template v-else>
            {{field.title}}
        </template>
    </u-th>
    <u-th v-if="actions">Action</u-th>
  </u-tr>
  <u-tr v-for="row in paginatedRows" @click="$emit('select', row)" :class="current_row==row?'bg-dark text-white':''">
    <u-td v-for="field in fields" :label="field.title">{{row[field.name]}}</u-td>
    <u-td v-if="actions">
        <a v-for="action in actions" @click="doAction(action, row)" :title="action.title" class="mr-1"><span :class="action.class">{{action.caption}}</span></a>
    </u-td>
  </u-tr>
  </u-table>
  <paginator v-bind:pages="pages" gap="5" v-bind:currentPage="currentPage" v-on:setPage="setPage($event)" v-on:setPrevPage="setPrevPage()" v-on:setNextPage="setNextPage()" class="text-center"></paginator>
</div>
`,
methods: {
  doAction: function (action, row) {
    this.$emit(action.action, row)
  }
}
})


Vue.component('form-field', {
  /*
    password
    email
    tel
    url

    label
    html
    string
    textarea
    number
    select
    checkbox
    radio
-- MD --
    date
    switch
    autocomplete
    chips
    file
  */
  props:['field', 'value'],
  template: `
<span>
  <div v-if="field.type=='label'" :id="'field_'+field.name">{{value}}</div>
  <div v-if="field.type=='html'" v-html="value"></div>

  <input v-if="field.type=='string'" type="text" class="form-control" :value="value" @input="$emit('input', $event.target.value)" v-on:keyup.enter="keyEnter()" :placeholder="field.placeholder" :maxlength="field.maxlength" :required="field.required" :pattern="field.pattern">
  <input v-if="field.type=='email'" type="email" class="form-control" :value="value" @input="$emit('input', $event.target.value)" v-on:keyup.enter="keyEnter()" :placeholder="field.placeholder" :maxlength="field.maxlength" :required="field.required" :pattern="field.pattern">
  <input v-if="field.type=='password'" type="password" class="form-control" :value="value" @input="$emit('input', $event.target.value)" v-on:keyup.enter="keyEnter()" :placeholder="field.placeholder" :maxlength="field.maxlength" :required="field.required" :pattern="field.pattern">
  <input v-if="field.type=='tel'" type="tel" class="form-control" :value="value" @input="$emit('input', $event.target.value)" v-on:keyup.enter="keyEnter()" :placeholder="field.placeholder" :maxlength="field.maxlength" :required="field.required" :pattern="field.pattern">
  <input v-if="field.type=='url'" type="url" class="form-control" :value="value" @input="$emit('input', $event.target.value)" v-on:keyup.enter="keyEnter()" :placeholder="field.placeholder" :maxlength="field.maxlength" :required="field.required" :pattern="field.pattern">

  <input v-if="field.type=='mydate'" type="date" class="form-control" :value="value" @input="$emit('input', $event.target.value)" v-on:keyup.enter="keyEnter()" :required="field.required" autocomplete="off">

  <textarea v-if="field.type=='textarea'" :value="value" @input="$emit('input', $event.target.value)" class="form-control" :placeholder="field.placeholder" :maxlength="field.maxlength" :required="field.required" :pattern="field.pattern"></textarea>
  <input v-if="field.type=='number'" :value="value" @input="$emit('input', $event.target.value)" :min="field.min" :max="field.max" :step="field.step" type="number" class="form-control" v-on:keyup.enter="keyEnter()" :placeholder="field.placeholder" :readonly="field.readonly">
  <select v-if="field.type=='select'" :value="value" @change="$emit('input', $event.target.value)" class="form-control" :required="field.required"><option v-for="item in field.items" :value="item.value">{{item.caption}}</option></select>

  <div v-if="field.type=='checkbox'" class="form-check">
    <input :checked="value == true" @change="console.log($event.target.checked); $emit('input', $event.target.checked)" :id="'field_'+field.name" type="checkbox" class="form-check-input">
    <label :for="'field_'+field.name" class="form-check-label">{{field.title}}</label>
  </div>

  <div v-if="field.type=='radio'">
    <div class="form-check" v-for="item in field.items">
      <input v-model="value" @change="$emit('input', $event.target.value)" :value="item.value" :id="'item_'+item.value" type="radio" class="form-check-input">
      <label :for="'item_'+item.value" class="form-check-label">{{item.caption}}</label>
    </div>
  </div>

  <!-- MD -->
  <!-- <md-datepicker v-if="field.type=='date'" :value="value" @input="$emit('input', $event)" :md-open-on-focus="true" :md-immediately="true" :md-override-native="true" :required="field.required" />
  -->
  <md-switch v-if="field.type=='switch'" v-model="value" @change="$emit('input', $event)">{{field.title}}</md-switch>

  <md-autocomplete v-if="field.type=='autocomplete'" :value="value" @input="$emit('input', $event)" :md-options="field.items" :required="field.required">
    <label>{{field.title}}</label>
  </md-autocomplete>

  <md-chips v-if="field.type=='chips'" :value="value" @input="$emit('input', $event)" md-placeholder="Add..."></md-chips>

  <md-field v-if="field.type=='file'">
    <label>{{field.title}}</label>
    <md-file :value="value" @input="$emit('input', $event)" :accept="field.accept" :placeholder="field.placeholder" :required="field.required" />
  </md-field>
  <!-- -->
</span>
`,
methods: {
  keyEnter: function () {
    this.$emit('keyEnter')
  }
}
})

Vue.component('standard-form', {
  props:['data', 'loading', 'fields', 'actions'],
  template: `
<form name="dataForm" autocomplete="off">
  <div class="form-group" v-for="field in fields">
    <label v-if="field.title && (['checkbox','switch','autocomplete','file'].indexOf(field.type)==-1)">{{field.title}}<sup v-if="field.required==true">*</sup></label>
    <form-field :field=field v-model="data[field.name]" :value=data[field.name] @keyEnter="submitForm(dataForm.checkValidity())" />
    <small v-if="field.help" class="form-text text-muted">{{field.help}}</small>
  </div>
  <div class="form-group">
    <input v-for="action in actions" type="button" :value="action.title" class="btn btn-primary m-1" @click="doAction(dataForm.checkValidity(), action)" :disabled="loading">
  </div>
</form>
`,
methods: {
  submitForm: function(valid) {
    // Default action executed by press enter
    for (let action of this.actions) {
      if (action.dafault && action.dafault == true) {
        this.doAction(valid, action)
        break;
      }
    }
  },
  doAction: function(valid, action) {
      this.$emit('action', {'action': action, 'row': this.data, 'valid': valid})
  }
}
})


Vue.component('standard-page', {
  props:['instance', 'title'],
  mixins: [crud, crud_front],
  data: function () {
    return {
        current_row: this.current_row,
        form_data: this.form_data
    }
  },
  template: `
<div>
<v-style>
.md-dialog {
  width: auto;
  overflow-y: auto;
}
</v-style>
  <div v-if="data">
    <button @click="form_data={}" class="btn btn-outline-primary float-right mb-1"><i class="fas fa-plus-square"></i> Create</button>
    <standard-table
      perpage="10"
      :rows="data"
      :current_row="current_row"
      :fields="appDataset[this.instance]['fields']['table']"
      :actions="[
          {name:'edit', caption:'', title: ' Edit', action: 'edit', class: 'fas fa-edit text-primary fa-icon-900'},
          {name:'delete', caption:'', title: 'Delete', action: 'delete', class: 'fas fa-eraser text-danger fa-icon-900'}
      ]"
      perpage="10"
      @select="selectRow($event)"
      @edit="editRow($event)"
      @delete="delete_front($event); form_data = null"
    />

    <div v-if="form_data">
      <md-dialog :md-active.sync="form_data" class="p-2 md-dialog">
        <h2>{{title}}</h2>
        <standard-form
            :data="form_data"
            :fields="appDataset[this.instance]['fields']['form']"
            :actions="[
                {name:'submit', title: 'Save', action: 'Save', class: '', dafault: true},
                {name:'cancel', title: 'Cancel', action: 'Cancel', class: ''}
            ]"
            @action="doAction($event)"
        />
      </md-dialog>
    </div>
  </div>
  <div v-else>
    No data...
  </div>
</div>`,
  mounted: function() {
    store.commit('title', this.title)
    this.instance_url = appDataset[this.instance]['url']
    this.read_front()
  },
  methods: {
    selectRow: function (row) {
        this.current_row = row
    },
    editRow: function (row) {
      this.current_row = row
      this.read_back(row, (one_row) => {
        this.form_data = one_row
      })
    },
    doAction: function($event) {
        if ($event.action.name == 'cancel') {
            this.form_data = null
        }
        if ($event.action.name == 'submit') {
            if ($event.valid == true) {
              if ($event.row.id > 0) {
                  // transfer data from form to current row
                  // if we uses this.update_front($event.row) the row in table will not update
                  for (key in $event.row) {
                    this.current_row[key] = $event.row[key]
                  }
                  this.update_front(this.current_row)
                  this.form_data = null
              }
              else {
                  this.create_front($event.row)
                  this.form_data = null
              }
            }
            else {
              app.alert('Form is NOT valid!', '<i class="fas fa-times-circle text-danger"></i> Error')
            }
        }
    }
  }
})


Vue.component('paginator', {
  props: {
    pages: Number,
    currentPage: Number,
    gap: Number,
    loading: Boolean
  },
  template: `
<nav v-show="pages > 1">
  <v-style>
    @media (max-width: 480px) {
      .xsm-hide {
        display: none !important;
      }
    }
  </v-style>
  <ul class="pagination justify-content-center">
    <li class="page-item" v-bind:class="{disabled: currentPage == 1}"><a @click="$emit('setPage', 1)" class="page-link">«</a></li>
    <li class="page-item" v-bind:class="{disabled: currentPage == 1}"><a @click="$emit('setPrevPage')" class="page-link">‹</a></li>
    <li v-for="page in rangepage" :class="'page-item' + (currentPage==page?' active':'')"><a @click="$emit('setPage', page)" class="page-link">{{page}}</a></li>
    <li class="page-item" v-bind:class="{disabled: currentPage == pages}"><a @click="$emit('setNextPage')" class="page-link">›</a></li>
    <li class="page-item" v-bind:class="{disabled: currentPage == pages}"><a @click="$emit('setPage', pages)" class="page-link">»</a></li>
  </ul>
</nav>`,
  computed: {
    ver () {
      return this.version==null?1:this.version
    },
    rangepage () {
      let ret = []
      let gap = 5
      let size = this.pages
      let page = this.currentPage

      if (typeof this.pages === 'undefined')
        return ret

      if (typeof this.gap !== 'undefined')
        gap = parseInt(this.gap) - 1

      let start = page - Math.floor(gap / 2)
      if (start < 1)
        start = 1

      var end = start + gap
      if (end > size) {
        end = size
        start = end - gap
        if (start < 1)
          start = 1
      }

      for (var i = start; i <= end; i++) {
        ret.push(i)
      }

      return ret
    }
  },
  created: function () {
    //this.onscroll = _.throttle(this._onscroll, 100)
  },
  mounted: function () {
    window.addEventListener('scroll', this.onscroll)
  },
  destroyed: function () {
    window.removeEventListener('scroll', this.onscroll)
  },
  methods: {
    //_onscroll: function () {
    onscroll: function () {
      let width = window.innerWidth
      let height = window.innerHeight
      let scrollTop = document.documentElement.scrollTop
      let document_height = document.documentElement.scrollHeight

      if (width < 1024) {
        if(height + scrollTop >= document_height ) {
          this.$emit('addNextPage')
        }
      }
    }
  }
})

Vue.component('header-order', {
  props: ['field', 'orderField', 'orderReverse'],
  template: `
<a @click="$emit('click', field)"><slot></slot>
<span v-if="orderField == field">
    <span v-if="orderReverse">&#11014;</span>
    <span v-else>&#11015;</span>
</span>
</a>`
})

Vue.component('table-menu', {
  props: ['sorting', 'orderField', 'orderReverse', 'showReload'],
  data: function () {
    return {
      show: this.show,
      filter: this.search,
    }
  },
  computed: {
    sortCaption: function () {
      return this.findOf(this.sorting, this.orderField, 'field', 'caption')
    }
  },
  template: `
<div>
  <a @click="toggleShow()" title="Show/Hide">&#x2630;</a>&nbsp;<a v-if="showReload" @click="$emit('reload')" title="Reload (Alt+F5)"><span class="feather icon-refresh-cw"></span></a>

    <div class="row mr-3 mt-1 mb-1" v-if="show">
      <div class="col-auto">
        <input type="text" class="form-control input-sm auto-width" maxlength="25" v-model="filter" @keyup="changeFilter()" placeholder="search">
      </div>
      <div class="col">
        <md-menu v-if="sorting">
          <md-button md-menu-trigger class="text-left">
            <a>
              <small v-if="orderField" title="Order by field">
                <span v-if="orderReverse">&#11014;</span>
                <span v-else>&#11015;</span>
                {{sortCaption}}
              </small>
              <span v-else title="Order by field">&#11014;&#11015;</span> 
            </a>
          </md-button>

          <md-menu-content>
            <md-menu-item v-for="item in sorting" @click="changeOrder(item)">{{item.caption}}</md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>
    </div>

</div>`,
mounted: function() {
  this.show = false
  this.filter = ''
},
methods: {
  toggleShow: function () {
    this.show = !this.show
    if (!this.show) {
      this.filter = ''
      this.changeFilter()
    }
  },
  changeFilter: function () {
    this.$emit('filter', this.filter)
  },
  changeOrder: function (item) {
    this.$emit('order', item)
  },
  findOf: function (obj, value, key, caption) {
    if ((obj == null) || (key == null) || (obj == value))
      return

    for (let i = 0; i < obj.length; i++) {
      if (obj[i][key] == value)
        return obj[i][caption]
    }
  }
}
})

Vue.component('u-table', {
  template: `
  <div classs="table-container">
    <table class="table table-bordered table-striped desktop-mobile">
        <slot></slot>
    </table>
  </div>
  `
})

Vue.component('u-tr', {
  template: `<tr @click="$emit('click')"><slot></slot></tr>`
})

Vue.component('u-th', {
  template: `<th><slot></slot></th>`
})

Vue.component('u-td', {
  props: ['label'],
  template: `<td><slot></slot><span class="td-label" v-if="label" v-html="label"></span></td>`
})


Vue.component('notification', {
  props: ['items', 'delay', 'lifetime'],
  template: `
  <div>
    <transition-group id="vue-simple-notify" name="veh-list" tag="div">
      <div v-for="notification in notifications" :key="notification.index">
        <div class="bs-component">
          <div class="alert alert-sm alert-border-left alert-dismissable" style="min-width:250px" :style="{ background: notification.color }">
            <button type="button" data-dismiss="alert" aria-hidden="true" class="close" @click="dismiss(notification.index)"></button><span class="veh-message" v-html="notification.message"></span>
          </div>
        </div>
      </div>
    </transition-group>
  </div>`,
  data () {
    return {
      notifications: []
    }
  },
  mounted () {
    this.normalizeParams()
    this.display(this)
  },
  methods:
  {
    normalizeParams () {
      this.items.map(function (obj, index) {
        obj.index = index
        obj.dismissable = typeof obj.dismissable !== 'undefined' ? obj.dismissable : true
        obj.message = typeof obj.message !== 'undefined' ? obj.message : ''
        obj.type = typeof obj.type !== 'undefined' ? obj.type : 'success'

        switch(obj.type) {
          case 'success':
            obj.color = '#02c385'
            break
          case 'warning':
            obj.color = '#ffc841'
            break
          case 'error':
            obj.color = '#fc5047'
            break
          case 'info':
            obj.color = '#30b5e1'
            break
          default:
            obj.color = '#bcbfcb'
        }
        return obj
      })
    },

    // Normalize parameters by adding optional parameters
    display (self) {
      this.clear()
      this.items.forEach(function (element, index) {
        setTimeout(() => {
          self.notifications.push(element)
        }, self.delay * index + 1)
      })
      clearInterval(this.timer)
      this.timer = setInterval(this.audodismiss, this.lifetime > 0 ? this.lifetime : 3000)
    },

    // Dismiss notification
    dismiss (index) {
      this.notifications.splice(index, 1)
      this.$emit('ondismiss', index)
    },

    // Clear all notifications
    clear () {
      this.notifications = []
    },
    audodismiss () {
      this.dismiss(0)
    },
  },
  watch:
  {
    items () {
      this.normalizeParams()
      this.display(this)
    }
  }
})


Vue.component('app-menu', {
  props:['version'],
  mixins:[crud, crud_front],
  /*
  data: function () {
	return {
		sections: this.sections
  }
  },
  */
  template: `
<span v-if="version=='mobile'">
  <ul class="navbar-nav mr-auto" v-for="section in data">
      <span class="text-secondary ml-2">{{section.section}}</span>
      <li class="nav-item pl-3" v-for="item in section.items">
        <a class="nav-link text-light" :href="item.path">{{item.item}}</a>
      </li>
  </ul>
</span>
<span v-else>
  <nav class="col-md-2 d-none d-md-block bg-light sidebar">
    <div v-if="data" class="sidebar-sticky">
      <span v-for="section in data">
        <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
          <span>*** {{section.section}} ***</span>
          <a class="d-flex align-items-center text-muted" href="#"></a>
        </h6>
        <ul class="nav flex-column">
          <a v-for="item in section.items" class="nav-link" :href="item.path">{{item.item}}</a>
        </ul>
      </span>
    </div>
  </nav>
</span>
`,
mounted: function () {
  this.instance = 'menu'
  this.instance_url = appDataset[this.instance]['url']
  this.read_front()
}
})

