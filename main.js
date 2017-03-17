function makeRequest (method, url, done) {
var xhr = new XMLHttpRequest();
xhr.open(method, url);
xhr.onload = function () {
  done(null, xhr.response);
};
xhr.onerror = function () {
  done(xhr.response);
};
xhr.send();
}

// And we'd call it as such:
var table = function(target,data,resource,optionField,opts){

  this.resource = resource;
  this.target = document.getElementById(target);
  this.data = JSON.parse(data);
  this.lengthTable = 0;
  this.targetName = target;
  this.optionField = optionField;
  this.tableStyle = {
    'table' : opts.class_table,
  }
  this.options = opts;

  this.table = document.createElement('table');
  this.table.className = this.tableStyle['table'] || '';
  this.thead = document.createElement('thead');
  this.tbody = document.createElement('tbody');
  this.tfoot = document.createElement('tfoot');
  this.navPagination = document.createElement('nav');
  this.searchInput = document.createElement('input');
  this.searchInput.type = 'search';
  this.searchInput.className = 'form-control';
  this.target.appendChild(this.searchInput);
  this.table.appendChild(this.thead);
  this.table.appendChild(this.tbody);

  this.prevLiLink = document.createElement('li');
  this.prevLiLink.className = 'page-item';
    this.prevALink = document.createElement('a');
    this.prevALink.href = '#';
    this.prevALink.className = 'page-link';
    this.prevTextLink = document.createTextNode('Anterior');

  this.nextLiLink = document.createElement('li');
  this.nextLiLink.className = 'page-item';
    this.nextALink = document.createElement('a');
    this.nextALink.href = '#';
    this.nextALink.className = 'page-link';
    this.nextTextLink = document.createTextNode('Siguiente');

  this.prevALink.appendChild(this.prevTextLink);
  this.prevALink.addEventListener('click',this.prevActionLink.bind(this),false);

  this.prevLiLink.appendChild(this.prevALink);

  this.nextALink.appendChild(this.nextTextLink);
  this.nextALink.addEventListener('click',this.nextActionLink.bind(this),false);

  this.nextLiLink.appendChild(this.nextALink);

  this.table.appendChild(this.tfoot);
  this.statusOrder = true;
  this.lastTextSearch = '';
  this.statusOrdering = '';

  this.paginationCache = {
    totalPage : 1,
    current : 1,
    prev : 1,
    prevLink : '',
    nextLink : '',
    next : 1,
    count : 1,
    perPage : 1,
  }
  this.lastLinkPress = '';

  this.init();
}

table.prototype.createPaginationCache = function () {
  /*
  this.paginationCache = {
    current : 1,
    prev : 1,
    next : 1,
    count : 1,
    perPage : 1,
  }
  */
  //http://localhost:8000/api/patient/?limit=10&page=2

  //function by http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript


  var data = this.data;
  var prevText = (data.count == 0) ? 0 : data.previous;
  var nextText = data.next;
  var previous = this.getParamByName('limit',prevText) || false;
  var next = this.getParamByName('limit',nextText) || false;

  var perPage = parseInt((previous) ? previous : (next) ? next : data.count);

  var totalPage = 0;
  //Homologacion per page cuando aun falta para completar paginas
  if (data.count%perPage !== 0) {
    totalPage = perPage - (data.count%perPage);
    totalPage = data.count + totalPage;
  }
  totalPage = (totalPage / perPage == 0) ? 1 : totalPage / perPage;

  //http://localhost:8000/api/patient/?limit=10&ordering=-description
  var param = this.getParamByName('offset',prevText) || 1;

  //"http://localhost:8000/api/patient/?limit=6&offset=12&ordering=description"
  console.log(param , perPage);
  current = (data.previous) ? (param / perPage)+1 :  1;



  this.paginationCache = {
    totalPage : data.final,
    current : data.current,
    prev :  (data.final < 2)? false : (data.prev ? data.current - 1 : false),
    prevLink : (data.final < 2)? false : (data.previous) ? data.previous : false,
    nextLink : (data.next) ? data.next : false,
    next : (data.next ? data.current + 1 : false),
    count : data.count,
    perPage : data.limit,
  }

  console.log(this);

  var _offset = data.current * data.limit - data.limit ;

  this.lastLinkPress = this.resource + '?limit=' + data.limit + '&offset=' + _offset;
  this.createPagination();
}

table.prototype.getParamByName = function(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

table.prototype.init = function(){
  this.createTableBody();
  this.createTableHead();
  this.listenSearch();
  //
  this.createPaginationCache();
}
table.prototype.createTableBody = function () {
  for (var i = 0; i < this.data.results.length; i++) {
    var tr = document.createElement('tr');
    var object = this.data.results[i];

    for (var v in object) {
      if (object.hasOwnProperty(v) && typeof object[v] != 'object' ) {
        var td = document.createElement('td');
        var text = document.createTextNode(object[v]);
        td.appendChild(text);
        tr.appendChild(td);
        this.lengthTable++;
      }
    }
    this.tbody.appendChild(tr);
  }
  this.appendTableToTarget();

}
table.prototype.appendTableToTarget = function () {
  this.target.appendChild(this.table);
}
table.prototype.createTableHead = function () {

    var tr = document.createElement('tr');
    var object = this.data.results[0];

    this.lengthTable = 0;
    for (var v in object) {
      if (object.hasOwnProperty(v) && typeof object[v] != 'object' ) {
        var th = document.createElement('th');

        var text = {};
        if (this.optionField.hasOwnProperty(v)) {
          if (document.createTextNode(this.optionField[v].name)) {
            text = document.createTextNode(this.optionField[v].name);
          }else{
            text = document.createTextNode(v);
          }
        }else{
          text = document.createTextNode(v);
        }

        var span = document.createElement('span');
        th.appendChild(span);

        th.appendChild(text);
        th.className = 'sorting';
        th.dataset.fieldName = v;
        th.addEventListener('click',this._click_th.bind(this),false);
        tr.appendChild(th);
        this.lengthTable++;
      }
    }
    this.thead.appendChild(tr);
}

table.prototype.createPagination = function(){

  this.ulPagination = document.createElement('ul');

  var tr = document.createElement('tr');
  var td = document.createElement('td');
      td.colSpan = this.lengthTable;

  this.ulPagination.className = 'pagination';

  this.navPagination.innerHTML = '';
  this.navPagination.appendChild(this.ulPagination);
  this.navPagination.className = 'pagination-container';
  td.appendChild(this.navPagination);
  tr.appendChild(td);

  this.tfoot.innerHTML = '';
  this.tfoot.appendChild(tr);



  if (this.paginationCache.prevLink) {
    this.prevALink.href = this.paginationCache.prevLink;
    this.ulPagination.appendChild(this.prevLiLink);
  }

  var current = this.paginationCache.current;
  var totalPage = this.paginationCache.totalPage;
  var min = (current - 2 < 1) ? 0 : current - this.options.min - 1;
      min = (min < 1)? 0 : min;
  var max = (current + 2 > totalPage) ? totalPage : current + this.options.max;
      max = (max > totalPage) ? totalPage : max;

  for (var i =  min; i < max; i++) {
    var li = document.createElement('li');
        li.className = (i+1 == this.paginationCache.current)? 'page-item active' : 'page-item';
    var a = document.createElement('a');
        a.className = (i+1 == this.paginationCache.current)? 'page-link active' : 'page-link';
        a.href = '#';
    var text = document.createTextNode(i+1);
        a.appendChild(text);
        if (i+1 != this.paginationCache.current) {
          a.href = i+1;
          a.dataset.link = i+1;
          a.addEventListener('click',this.aPaginationAction.bind(this),false);
        }

        li.appendChild(a);
        this.ulPagination.appendChild(li);

  }

  if (this.paginationCache.nextLink) {
    this.nextALink.href = this.paginationCache.nextLink;
    this.ulPagination.appendChild(this.nextLiLink);
  }

  this.ulInfoPagination  = document.createElement('ul')
  this.ulInfoPagination.className = "pagination-info";
  this.liInfoPagination  = document.createElement('li');

  this.textInfoPagination = document.createTextNode(this.paginationCache.current + '/' + this.paginationCache.totalPage);

  this.liInfoPagination.className = 'page-info';
  this.liInfoPagination.appendChild(this.textInfoPagination);
  this.ulInfoPagination.appendChild(this.liInfoPagination);
  this.navPagination.appendChild(this.ulInfoPagination);

}
table.prototype.aPaginationAction = function (event) {
  event.preventDefault();
  var number = event.target.dataset.link;

  var self = this;
  makeRequest('GET', this.resource + '?' + this.getQuery({number : number }), function (err, datums) {
  if (err) { throw err; }
    self.data = JSON.parse(datums);
    self.reset();
    self.createTableBody();
    self.createPaginationCache();
  });

}
table.prototype.prevActionLink = function (event) {
  event.preventDefault();
  console.log(event.target.href);
  this.lastLinkPress = event.target.href;
  console.log(this);

  var self = this;
  makeRequest('GET', this.resource + '?' + this.getQuery(), function (err, datums) {
  if (err) { throw err; }
    self.data = JSON.parse(datums);
    self.reset();
    self.createTableBody();
    self.createPaginationCache();
  });
}
table.prototype.nextActionLink = function (event) {
  event.preventDefault();
  console.log(event.target.href);
  this.lastLinkPress = event.target.href;
  console.log(this);

  var self = this;
  makeRequest('GET', this.resource + '?' + this.getQuery(), function (err, datums) {
  if (err) { throw err; }
    self.data = JSON.parse(datums);
    self.reset();
    self.createTableBody();
    self.createPaginationCache();
  });
}

table.prototype._click_th = function (event) {
  var target = event.srcElement;
  var name = target.dataset.fieldName;
  var self = this;
  this.statusOrder = !this.statusOrder;

  var statusOrdering = name;
  if (this.statusOrder) {
    //console.log('desc');
  }else{
    //console.log('asc');
    statusOrdering = '-' + name;
  }

  //add sorting className
  for (var i = 0; i < this.thead.children[0].children.length; i++) {
    var elmTag = this.thead.children[0].children[i];
    if (elmTag.dataset.fieldName == name) {
      elmTag.className = this.statusOrder ? 'sorting sorting-desc' : 'sorting sorting-asc';
    }else{
      elmTag.className = 'sorting';
    }
  }

  this.statusOrdering = statusOrdering;

  makeRequest('GET', this.resource + '?'+ this.getQuery(), function (err, datums) {
  if (err) { throw err; }
    self.data = JSON.parse(datums);
    self.reset();
    self.createTableBody();
    self.createPaginationCache();
  });

}
table.prototype.getQuery = function (obj) {

  var is_search = (obj) ? obj.is_search : false;
  var pageNumber = (obj) ? obj.number : false;
  var queryPagination = this.lastLinkPress;
  var queryPagination2 = this.lastLinkPress;
  var offset = '';
  var limit = '';
  if (queryPagination && !is_search) {
    offset = this.getParamByName('offset',queryPagination);
    limit = this.getParamByName('limit',queryPagination2);
  }

  if (pageNumber) {
    offset = limit * (pageNumber-1);
  }

  var query = 'search='+ this.lastTextSearch;
  var query2 = (this.lastTextSearch ? query + '&' : '') + 'ordering=' + this.statusOrdering;
  var query3 = (limit ? '&limit=' + limit : '') + (offset ? '&offset=' + offset : '') + (offset || limit ? '&' : '') + query2;
  return query3;
}
table.prototype.reset = function(){
  this.tbody.innerHTML = '';
}

table.prototype.listenSearch = function () {
  this.searchInput.addEventListener('input', this.searchAction.bind(this),false);
}
table.prototype.searchAction = function (event) {
  var self = this
  this.lastTextSearch = event.srcElement.value;
  this.statusOrdering;

  makeRequest('GET', this.resource + '?' + this.getQuery({is_search : true}), function (err, datums) {
  if (err) { throw err; }
    self.data = JSON.parse(datums);
    self.reset();
    self.createTableBody();
    self.createPaginationCache();
  });
}

var djangoRestTable = function(taget,resource,optionField,tableStyle){
  makeRequest('GET', resource, function (err, datums) {
  if (err) { throw err; }
    new table(taget,datums,resource,optionField,tableStyle);
  });
}
