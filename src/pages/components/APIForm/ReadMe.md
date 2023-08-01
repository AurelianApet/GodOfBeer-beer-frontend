# APIForm 사용설명서



## Props
1. ### pFormInfo

form을 구성하는 항목(item)들의 배치상태를 정의한다.
한개 렬에 놓이는 항목들을 배렬로 정의하며 그 렬들의 배렬로 pFormInfo를 구성한다.
매 항목들이 가질수 있는 속성값들을 아래에 보여주었다.

* name: _String_ 

해당 마당을 구분하기 위한 이름이다. 자료기지에 들어갈 field이름과 일치되여야 한다.

* title: _Object_

form에 보여줄 문자이다. 나타낼 문자의 형태와 값을 나타낸다.

Field|Type|Values|DefaultValues|Description
|--|--|--|--|--
type|number|TITLE_NORMAL, TYPE_ICON, TYPE_CUSTOM|_null_


Field|Type|Values|DefaultValues|Description|Example
|:-|:--|:---|:--|:---|:---
title| _Object_|||form에 보여줄 문자이다. 나타낼 문자의 형태와 값을 나타낸다.
className|_String_|||해당 CELL에 class를 추가한다.
style|Object|||해당 CELL에 style을 추가한다.|style: {minWidth: '150px'},
colSapn|_Number_||1|해당 CELL이 몇개의 칸을 차지하는가를 나타낸다.
rowSpan|_Number_||1|해당 CELL이 몇개의 행을 차지하는가를 나타낸다.
type||TYPE_INPUT, TYPE_FILE_ATTACH, TYPE_BLANK, TYPE_RADIO, TYPE_OPTION, TYPE_DATE, TYPE_CHECK, TYPE_MASK_INPUT, TYPE_NUMBER, TYPE_SELECT, TYPE_TIME, TYPE_DATETIME, TYPE_CUSTOM, TYPE_SUBMIT_BUTTON, TYPE_APISELECT, TYPE_TEXTAREA, TYPE_CHONJIEDITOR, TYPE_FILEUPLOAD, TYPE_USER_SELECT, TYPE_COMPONENT_ARRAY|TYPE_INPUT|해당 CELL의 형태를 나타낸다.
checkValidation|_Function_|`( input ) => {}`|null|validation검사를 진행하는 함수부분이다. 오유가 없다면 null을 오유가 있다면 현시할 문자렬을 되돌린다.
value|_Array_|{value, title,}들의 배렬||CELL의 형태가 RADIO일때 쓰인다.|`value: [{value: '남자', title: '남자'}, {value: '녀자', title: '녀자'},],`
data|_Array_|{value, title,}들의 배렬|required|Select를 리용할 때 
url|_String_||null|APISelect를 리용할 때 자료를 얻어오기 위한 url을 설정한다.
kind|_String_|||Option을 리용할 때 그의 분류를 나타낸다.
enableMultiSelect|_Boolean_|true, false|false|Option을 리용할 때 다중선택가능성을 나타낸다.
mask|_Array_|||MaskedInput를 리용할 때 그의 mask를 나타내다.|손전화번호입력일때 `mask: [0, /[1-9]/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],`
shortKeyInfo|_Object_|{shortKey, key,}|null|Button을 리용할 때 단축건을 설정한다. 가능한 shortKey종류를 아래에 보여주었다. |`shortKeyInfo: {shortKey: SHORTKEY_CTRL_ALT, key: 'Enter' },`

> Example
```js
sBasicInfoColumns: [
        [
          {
            name: 'name',
            title: '이름',
            checkValidation: ( input ) => {
              if (!input || input.length === 0) {
                return '이름을 입력하십시오.';
              }
              if ( input.length > 4 ) {
                return '이름은 4글자 이하여야 합니다.';
              }
              return null;
            },
          },
          {
            name: 'gender',
            title: '성별',
            type: TYPE_RADIO,
            value: [
              {value: '남자', title: '남자'},
              {value: '녀자', title: '녀자'},
            ],
            checkValidation: ( input ) => {
              if (!input || input.length === 0) {
                return '성별을 입력하십시오.';
              }
              return null;
            }
          },
          {
            name: 'birthday',
            title: '생년월일',
            type: TYPE_DATE,
            checkValidation: ( input ) => {
              if (!input || input.length === 0) {
                return '날자를 입력하십시오.';
              }
              return null;
            }
          },
          {
            name: 'photo',
            title: '사진',
            colSpan: 2,
            rowSpan: 4,
            type: TYPE_FILE_ATTACH,
          },
        ],
        [
          {
            name: 'department',
            title: '부서',
            type: TYPE_APISELECT,
            url: '/departments',
            checkValidation: ( input ) => {
              if ( !input || input === ' ') {
                return '부서를 입력하십시오.';
              }
              return null;
            }
          },
          {
            type: TYPE_BLANK,
          },
          {
            name: 'position',
            title: '직위',
            type: TYPE_OPTION,
            kind: 'position',
            checkValidation: ( input ) => {
              if (!input || input.length === 0) {
                return '직위를 입력하십시오.';
              }
              return null;
            }
          },
        ],
        [
          {
            name: 'l_phoneNumber',
            title: '집전화',
            type: TYPE_MASK_INPUT,
            mask: [0, /[1-9]/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
          },
          {
            name: 'm_phoneNumber',
            title: '손전화',
            type: TYPE_MASK_INPUT,
            mask: [1, 9, /[15]/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
          },
          {
            name: 'familyMember',
            title: '가족수',
            type: TYPE_NUMBER,
          },
        ],
        [
          {
            name: 'militaryRelation',
            title: '군사관계',
            type: TYPE_OPTION,
            enableMultiSelect: true,
            kind: 'militaryRelation',
          },
          {
            name: 'bloodType',
            title: '피형',
            type: TYPE_SELECT,
            value: [
              {
                value: 'none',
                title: '',
              },
              {
                value: 'A형',
                title: 'A형',
              },
              {
                value: 'B형',
                title: 'B형',
              },
              {
                value: 'O형',
                title: 'O형',
              },
              {
                value: 'AB형',
                title: 'AB형',
              }
            ]
          },
          {
            type: TYPE_CHECK,
            value: [
              {
                name: 'marriage',
                title: '결혼',
              },
              {
                name: 'householder',
                title: '세대주',
              },
              {
                name: 'hostel',
                title: '합숙',
              },
            ],
          },
        ],
        [
          {
            type: TYPE_SUBMIT_BUTTON,
            colSpan: 8,
            kind: BUTTON_NORMAL,
            shortKeyInfo: {
              shortKey: SHORTKEY_CTRL_ALT, 
              key: 'Enter'
            },
            title: '저장',
            className: 'submit-button-basic-info',
          }
        ],
      ],
```

2. ### pAPIInfo

  form의 Create, Read, Update, Delete를 수행하기 위한 설정을 진행한다.

  mode와 결합하여 리용한다.
  ```js
pAPIInfo={{
  select: {
    queries: [],
    callback: ( res, func ) => { },
  },
  create: {
    queries: [],
    callback: ( res, func ) => { },
  },
  update: {
    queries: [],
    callback: ( res, func ) => { },
  },
  delete: {
    queries: [],
    callback: ( res, func ) => { },
  },
}}
  ```
  key|description
  |--|--
  select|`read` 또는 `update`방식에서 `APIForm`이 적재될때 처음으로 실행된다. 주로 _get_ 방식의 요청에 해당된다.
  create|`create`방식에서 `submitButton`을 눌렀을 때 실행된다. 주로 _post_ 방식에 해당된다.
  update|`update`방식에서 `submitButton`을 눌렀을 때 실행된다. 주로 _put_ 방식에 해당된다.

> queries

key|type|value|defaultValue|description|example
|--|--|--|--|--|--
method|_String_|_get, post, put_|_get_|요청의 방식을 나타낸다.
url|_String_|||요청을 하려는 url을 지적한다.
data|_Function_|`( formData ) => { }`|_null_|요청할 때 자료형식을 customize할수 있다.|`data: ( formData ) => { return ({ basicInfo: formData, }); },`
params|_Object_|||요청url에 params를 덧붙인다.|`url: '/social/news', params: { a: '1', b: '2', },` 일 때 url은 `'social/news?a=1&b=2'`으로 된다.

여러개의 요청을 해야 할경우 queries를 배렬로 주면 된다.

>callback

해당 queries를 실행한 다음에 호출된다.
queries가 여러개인 경우 매 queries들의 실행결과를 조합하는것과 같은 여러가지 추가적인 동작을 진행할수 있다.


