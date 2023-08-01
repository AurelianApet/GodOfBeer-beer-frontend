export const params = {
    //role_id
    ROLE_ADMIN : 1,
    ROLE_SUB_ADMIN : 2,
    ROLE_PROVIDER : 3,
    ROLE_SELLER : 4, 
    ROLE_USER : 5,
    ROLE_PUB_MANAGER : 6,

    roles : ['', 'ROLE_ADMIN', 'ROLE_SUB_ADMIN', 'ROLE_PROVIDER', 'ROLE_SELLER', 'ROLE_USER', 'ROLE_PUB_MANAGER'],

    //active
    deactive : 0,
    active : 1,
    blocked : 2,
    wait : 3,

    //companytype
    brewery : 0,
    importer : 1,

    //license
    license : 0,
    privacy : 1,
    personal : 2,
    copyright : 3,

    //usertype
    beer : 0,
    wine : 1,

    //brewerytype
    domestic : 0,
    abroad : 1,

    //categorytype
    category_food : 0,
    category_beer : 1,
    category_wine : 2,

    //ordertype
    ALL : 0,
    INDIVIDUAL : 1,

    //visittype
    visit_beer : 0,
    visit_brewery : 1,
    visit_pub : 2,

    //payment_tpe
    pay_cash : 0,
    pay_card : 1,
};