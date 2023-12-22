Vue.component('v-style', {
  render: function (createElement) {
    return createElement('style', this.$slots.default)
  }
});

Vue.component('standard-table', {
  mixins:[table],
  methods: {
      formatField(fieldType, value) {
        if ( fieldType != 'mydate' || !value ) return value;

        const valueDate = new Date(value);
        return valueDate.toLocaleDateString({ day: 'numeric', month: 'numeric', year: 'numeric' });
      }
  },
  template: `
<div>
  <v-style>
    .selected-text {
      background-color: yellow;
    }
  </v-style>

  <u-table>
  <u-tr>
    <u-th v-for="field in fields">
        <template v-if="field.sort">
             <header-order :field="field.name" :field_type="field.type" :orderField="orderField" :orderReverse="orderReverse" @click="(field)=>{$emit('order', field)}">{{field.title}}</header-order>
        </template>
        <template v-else>
            {{field.title}}
        </template>
    </u-th>
    <u-th v-if="actions">Операція</u-th>
  </u-tr>
  <u-tr v-for="row in rows" @click="$emit('select', row)" :class="current_row==row?'bg-dark text-white':''">
    <u-td v-for="field in fields" :label="field.title" v-html="$options.filters.colorTheFound(formatField(field.type, row[field.name]), search)"></u-td>
    <u-td v-if="actions">
      <template v-for="action in actions">
        <!-- не виводимо кнопку  "delete" для проведених документів -->
        <a v-if="action.action !='delete' || !row.doc_status || row.doc_status == 0" @click="doAction(action, row)" :title="action.title" class="mr-1"><span :class="action.class">{{action.caption}}</span></a>
      </template>
    </u-td>
  </u-tr>
  </u-table>

</div>
`
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

  <!--  Мої типи полів -->
  <input v-if="field.type=='mydate'" type="date" class="form-control" :value="value" @input="$emit('input', $event.target.value)" v-on:keyup.enter="keyEnter()"
  :required="field.required" autocomplete="off" :readonly="field.readonly">

  <select v-if="field.type=='select'" v-model="value" @change="$emit('input', $event.target.value); $emit('change_val', {value: $event.target.value, fieldName: field.name})"
  class="form-control" :readonly="field.readonly" :required="field.required"><option v-for="item in field.items" :value="item.value">{{item.caption}}</option></select>
  <!-- ----------- -->

  <input v-if="field.type=='string'" type="text" class="form-control" :value="value" @input="$emit('input', $event.target.value)" v-on:keyup.enter="keyEnter()"
  :placeholder="field.placeholder" :maxlength="field.maxlength" :required="field.required" :pattern="field.pattern" :readonly="field.readonly">
  <input v-if="field.type=='email'" type="email" class="form-control" :value="value" @input="$emit('input', $event.target.value)" v-on:keyup.enter="keyEnter()" :placeholder="field.placeholder" :maxlength="field.maxlength" :required="field.required" :pattern="field.pattern">
  <input v-if="field.type=='password'" type="password" class="form-control" :value="value" @input="$emit('input', $event.target.value)" v-on:keyup.enter="keyEnter()" :placeholder="field.placeholder" :maxlength="field.maxlength" :required="field.required" :pattern="field.pattern">
  <input v-if="field.type=='tel'" type="tel" class="form-control" :value="value" @input="$emit('input', $event.target.value)" v-on:keyup.enter="keyEnter()" :placeholder="field.placeholder" :maxlength="field.maxlength" :required="field.required" :pattern="field.pattern">
  <input v-if="field.type=='url'" type="url" class="form-control" :value="value" @input="$emit('input', $event.target.value)" v-on:keyup.enter="keyEnter()" :placeholder="field.placeholder" :maxlength="field.maxlength" :required="field.required" :pattern="field.pattern">

  <textarea v-if="field.type=='textarea'" :value="value" @input="$emit('input', $event.target.value)" class="form-control" :placeholder="field.placeholder" :maxlength="field.maxlength" :required="field.required" :pattern="field.pattern"></textarea>
  <input v-if="field.type=='number'" :value="value" @input="$emit('input', $event.target.value)" :min="field.min" :max="field.max" :step="field.step" type="number" class="form-control"
  v-on:keyup.enter="keyEnter()" :placeholder="field.placeholder" :readonly="field.readonly">

  <select v-if="field.type=='old_select'" v-model="value" @change="$emit('input', $event.target.value)" class="form-control" :readonly="field.readonly" :required="field.required"><option v-for="item in field.items"
  :value="item.value">{{item.caption}}</option></select>

  <div v-if="field.type=='checkbox'" class="form-check">
    <input :checked="value == true" @change="$emit('input', $event.target.checked)" :id="'field_'+field.name" type="checkbox" class="form-check-input">
    <label :for="'field_'+field.name" class="form-check-label">{{field.title}}</label>
  </div>

  <div v-if="field.type=='radio'">
    <div class="form-check" v-for="item in field.items">
      <input v-model="value" @change="$emit('input', $event.target.value)" :value="item.value" :id="'item_'+item.value" type="radio" class="form-check-input">
      <label :for="'item_'+item.value" class="form-check-label">{{item.caption}}</label>
    </div>
  </div>

  <!-- MD -->
  <md-datepicker v-if="field.type=='date'" :value="value" @input="$emit('input', $event)" :md-open-on-focus="true" :md-immediately="true" :md-override-native="true" :required="field.required" />
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
  data : function () {
    return {
      // For interactivity
      form_fields: this.form_fields
    }
  },
  template: `
<form name="dataForm" autocomplete="off">
  <div class="form-group" v-for="field in form_fields">
    <label v-if="field.title && (['checkbox','switch','autocomplete','file'].indexOf(field.type)==-1)">{{field.title}}<sup v-if="field.required==true">*</sup></label>
    <form-field :field=field v-model="data[field.name]" :value=data[field.name] @keyEnter="submitForm(dataForm.checkValidity())" />
    <small v-if="field.help" class="form-text text-muted">{{field.help}}</small>
  </div>
  <div class="form-group">
    <input v-for="action in actions" type="button" :value="action.title" class="btn btn-primary m-1" @click="doAction(dataForm.checkValidity(), action)" :disabled="loading">
  </div>
</form>
`,
mounted: function() {
  // For interactivity
  this.form_fields = this.fields
},
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

// ===================================== Таблиця-перелік записів обраної моделі ===============================
Vue.component('instance-page', {
  mixins: [crud, crud_front, crud_ext, paginator_server /*, paginator_local*/],
  template: `
<div>
  <div v-if="data">
    <button @click="addRow()" class="btn btn-outline-primary float-right mb-1"><i class="fas fa-plus-square"></i> Create</button>

    <table-menu
      :sorting="sortFields"
      :orderField="orderField"
      :orderReverse="orderReverse"
      @order="order($event.field, $event.type)"
      :searchText="search"
      @search="searchApply($event)"
    />

    <standard-table
      :rows="data"
      :fields="fields"
      :current_row="current_row"
      :orderField="orderField"
      :orderReverse="orderReverse"
      :search="search"

      :actions="[
          {name:'edit', caption:'', title: 'Змінити', action: 'edit', class: 'fas fa-edit text-primary fa-icon-900'},
          {name:'delete', caption:'', title: 'Видалити', action: 'delete', class: 'fas fa-eraser text-danger fa-icon-900'}
      ]"

      @select="selectRow($event)"
      @order="order($event, 'string')"
      @edit="editRow($event)"
      @delete="delete_front($event); form_data = null"
    />

    <paginator
      :pages="paginator_pages"
      gap="7"
      :currentPage="paginator_page"
      :row_count="data_rows_count"
      @setPage="setPage($event)" @setPrevPage="setPrevPage()" @setNextPage="setNextPage()"
      class="text-center"
    />

  </div>
</div>`,
})

// ================================  Бланк коригування обраного запису таблиці-переліку ==================================
Vue.component('instance-edit', {
  mixins: [crud, crud_ext, edit],
  template: `
<div>
  <div v-if="data">
    <standard-form
      :data=data
      :fields=form_fields
      :actions="[
          {name:'submit', title: 'Зберегти', action: 'Save', class: '', dafault: true},
          {name:'cancel', title: 'Cancel', action: 'Cancel', class: ''}
      ]"
      @action="doAction($event)"
    />
  </div>
</div>`
})

// ==============  Коригування накладних =======================
Vue.component('invoice-form', {
  props:['data', 'confirmed', 'fields', 'actions'],
  data : function () {
    return {
      // For interactivity
      form_fields: this.form_fields
    }
  },
  template: `
<form name="dataForm" autocomplete="off">
  <table whidth="100%">
    <tr v-for="field in form_fields">
        <td>
            <label v-if="field.title && (['checkbox','switch','autocomplete','file'].indexOf(field.type)==-1)">{{field.title}}<sup v-if="field.required==true">*</sup></label>
        </td>
        <td>
            <form-field :field=field v-model="data[field.name]" :value=data[field.name] @keyEnter="submitForm(dataForm.checkValidity())" />
            <small v-if="field.help" class="form-text text-muted">{{field.help}}</small>
        </td>
    </tr>
  </table>
  <div class="form-group">
    <input v-for="action in actions" type="button" :value="action.title" class="btn btn-primary m-1" @click="doAction(dataForm.checkValidity(), action)" :disabled="action.disabled">
  </div>
</form>
`,
mounted: function() {
  // For interactivity
  this.form_fields = this.fields
},
watch: {
    // Спостерігаємо за змінами this.fields і оновлюємо form_fields
    fields: function(newFields, oldFields) {
      this.form_fields = newFields;
    }
  },
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

Vue.component('invoce-edit', {
  mixins: [crud, crud_ext, crud_detail, edit_invoce],
  template: `
<div>
  <!--  --- Шапка накладної --- -->
  <div v-if="data">
    <invoice-form
      :data=data
      :confirmed=confirmed
      :fields="isEdit ? form_fields : formReadonlyFields"
      :actions="invoceActions"
      @action="doAction($event)"
    />

    <!-- --- Рядки накладної --- -->
      <button v-if="!confirmed" @click="addRowDetail()" class="btn btn-outline-primary float-right mb-1"><i class="fas fa-plus-square"></i> Create</button>

    <standard-table
      :fields=detail_fields
      :rows=detail_data
      :current_row="current_row"
      :actions="isEdit ? editRowActions : ''"

      @select="selectRowDetail($event)"
      @edit="editRowDetail($event)"
      @delete="deleteRowDetail($event)"
    />
  </div>
`
})

// ==============  ЗВІТИ =======================
Vue.component('instance-report', {
  mixins: [crud, crud_front, paginator_local, report],
  data : function () {
    return {
      // For interactivity
      page: this.page,
      form_fields: this.form_fields
    }
  },
  template: `
<div>
  <!--  --- Форма вводу параметрів Звіту --- -->
  <div v-if="data_params">
    <invoice-form
      :data=data_params
      :fields=form_fields
      :actions="[
                  {name:'submit', title:'Сформувати звіт', action: 'Save', class: '', dafault:true},
                  {name:'cancel', title:'Закрити', action: 'Cancel', class: ''}
                ]"
      @action="doAction($event)"
    />
  </div>

  <!-- --- Рядки звіту --- -->
  <div v-if="data">
    <table-menu
      @filter="search=$event"
      @order="order($event.field, $event.type)"
      :sorting="sortFields"
      :orderField="orderField"
      :orderReverse="orderReverse"
    />

    <standard-table
      :rows="paginatedRows"
      :fields="fields"
      :current_row="current_row"
      :orderField="orderField"
      :orderReverse="orderReverse"
      :search="search"
      :actions="''"

      @select="selectRow($event)"
      @order="order($event, 'string')"
    />
    <paginator
      :pages="paginator_pages"
      gap="5"
      :row_count="data_rows_count"
      :currentPage="paginator_page"
      @setPage="setPage($event)"   @setPrevPage="setPrevPage()" @setNextPage="setNextPage()"
      class="text-center">
    </paginator>
  </div>
</div>
`
//     <paginator v-bind:pages="paginator_pages" gap="5" v-bind:currentPage="paginator_page" v-on:setPage="setPage($event)" v-on:setPrevPage="setPrevPage()" v-on:setNextPage="setNextPage()" class="text-center"></paginator>

 ,
  beforeMount: function () {
    this.data_params = []
    this.instance = this.instance_name
    this.form_fields = appDataset[this.instance]['fields']['form']
//    this.data_rows_count = 0
  },
  watch: {
    // Спостерігаємо за змінами this.fields і оновлюємо form_fields
    page: function(newFields, oldFields) {
      rows = this.paginatedRows
    },
    form_fields: function(newFields, oldFields) {
      this.form_fields = newFields;
      this.data_params = []
    }
}

})

// =============================================

Vue.component('paginator', {
  props: {
    pages: Number,
    currentPage: Number,
    gap: Number,
    loading: Boolean,
    row_count: Number
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
  <span>Всього:  сторінок <b>{{ pages }}</b>,  рядків <b>{{ row_count }}</b></span>
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
  props: ['field', 'field_type', 'orderField', 'orderReverse'],
  template: `
<a @click="$emit('click', {field, field_type})"><slot></slot>
<span v-if="orderField == field">
    <span v-if="orderReverse">&#11015;</span>
    <span v-else>&#11014;</span>
</span>
</a>`
})

Vue.component('table-menu', {
  props: ['searchText', 'sorting', 'orderField', 'orderReverse', 'showReload'],
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
      <div class="col-auto p-0">
        <input type="text" class="form-control input-sm auto-width" maxlength="25" v-model="filter" @keyup="changeFilter()" @keyup.enter="search()" placeholder="ключ пошуку...">
      </div>
      <div class="col-auto p-0">
        <button @click="search()" class="btn bt-sm"><i class="fas fa-search text-primary" title="Search"></a></button>
      </div>
      <div class="col p-0">
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
  //this.filter = ''
  this.show = (typeof this.searchText != 'undefined' & this.searchText !='')
  this.filter = this.searchText
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
  search: function () {
    this.$emit('search', this.filter)
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

// ==============================  ГОЛОВНЕ МЕНЮ =====================
Vue.component('app-menu', {
  props:['version'],
  mixins:[crud, crud_front],
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
          <span>{{section.section}}</span>
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


/*-----------------------------------------------------------------------------------'''
Є роут та компонент.
Для різних :instance  задані різні поля для форми form_fields:
для report1
    form_fields = [
        {name:'date_start', 'title': 'Початкова дата періоду', type:'mydate', required:'required'},
        {name:'date_end', 'title': 'Кінцева дата періоду', type:'mydate', required:'required'} ]
для report2
    form_fields = [
        {name:'date_rep', 'title': 'Дата звіту', type:'mydate', required:'required'} ].
Якщо викликати  "report/report1", а потім зразу  "report/report2", то значення form_fields  передається, але компонент instance-report  не обновляється на екрані.
Якщо викликати  "report/report1", потім ітший роут (наприклад "/"), а потім "report/report2", то компонент instance-report обновляється на екрані.
Як виправити?

Роут
  { path: '/report/:instance', component: { template: '<instance-report />' } },

Компонент
Vue.component('instance-report', {
  mixins: [crud, crud_front, paginator_local, report],
  data : function () {
    return {
      // For interactivity
      page: this.page,
      instance: this.instance,
      form_fields: this.form_fields
    }
  },

  template: `
<div>
  <!--  --- Форма вводу параметрів Звіту --- -->
  <div>
    <standard-form
      :data=data_params
      :fields=form_fields
      :actions="[
                  {name:'submit', title:'Сформувати звіт', action: 'Save', class: '', dafault:true},
                  {name:'cancel', title:'Закрити', action: 'Cancel', class: ''}
                ]"
      @action="doAction($event)"
    />
  </div>

  <!-- --- Рядки звіту --- -->
    <standard-table
      :rows="paginatedRows"
      :fields="fields"

    />
  </div>
`,
  beforeMount: function () {
    this.data_params = []
    this.data = null
    this.instance = this.instance_name
    this.form_fields = appDataset[this.instance]['fields']['form']
  },
  beforeUnmount: function () {
    this.data_params = []
    this.data = null
    this.instance = null
    this.form_fields = null
  },
  watch: {
    // Спостерігаємо за змінами this.fields і оновлюємо form_fields
    page: function(newFields, oldFields) {
      rows = this.paginatedRows
    },
    form_fields: function(newFields, oldFields) {
      this.form_fields = newFields;
      this.instance = this.instance_name
    }
}

})
*/