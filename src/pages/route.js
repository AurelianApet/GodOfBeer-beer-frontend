// helper
import { PrivateRoute, NormalRoute } from '../library/route_helper';

// Authentication
import BeerDashboard          from './pages/Auth/BeerDashboard';
import ResetPassword          from './pages/Auth/ResetPassword';
import Review                 from './pages/User/Review';
import ProducerBeerInfo       from './pages/Producer/ProducerBeerInfo';
import ProducerBrewerys       from './pages/Producer/ProducerBrewerys';
import ProducerEventinfo      from './pages/Producer/ProducerEventinfo';
import TapSellProvider        from './pages/Producer/TapSellProvider';
import BeerSellDetail         from './pages/Producer/BeerSellDetail';

// Common
import Search                 from './pages/Common/Search';
import BeerSearch             from './pages/Common/BeerSearch';
import BrewerySearch          from './pages/Common/BrewerySearch';
import PubSearch              from './pages/Common/PubSearch';
import MyInfo                 from './pages/Common/MyInfo'   ;
import BeerDetail             from './pages/Common/BeerSearch/BeerDetail';
import BreweryDetail          from './pages/Common/BrewerySearch/BreweryDetail';
import AbroadBrewery          from './pages/Common/BrewerySearch/AbroadBrewery';
import CommonLicense          from './pages/Common/License';
import CommonPrivacy          from './pages/Common/Privacy';
import CommonOrder            from './pages/Common/Order';

// Seller
import PubInfo                from './pages/Seller/SellerPubInfo';
import SellerMenu             from './pages/Seller/SellerMenu';
import QRCodeRegister         from './pages/Seller/QRCodeRegister';
import SellerStatistic        from './pages/Seller/SellerStatistic';
import TapSellList            from './pages/Seller/TapSellList';

// Admin
import RegisterStatus         from './pages/Admin/RegisterStatus';
import ProviderStatus         from './pages/Admin/ProviderStatus';
import SellerStatus           from './pages/Admin/SellerStatus';
import BlockedSellerStatus    from './pages/Admin/SellerStatus/blocked';
import UserStatus             from './pages/Admin/UserStatus';
import UserDetail             from './pages/Admin/UserStatus/UserDetail';
import PubDetail              from './pages/Common/PubSearch/PubDetail';
import ProviderDetail         from './pages/Admin/ProviderStatus/ProviderDetail';
import SellerDetail           from './pages/Admin/SellerStatus/SellerDetail';
import PubManagerStatus       from './pages/Admin/PubManagerStatus';
import AdminPubManagerDetail  from './pages/Admin/PubManagerStatus/PubManagerDetail';
import Interception           from './pages/Admin/Interception';
import InterceptionDetail     from './pages/Admin/Interception/InterceptionDetail';
import Statistics             from './pages/Admin/Statistics';
import Domestic               from './pages/Admin/DomesticBrewery';
import Abroad                 from './pages/Admin/AbroadBrewery';
import BeerInfo               from './pages/Admin/BeerInfo';
import Advertise              from './pages/Admin/Advertise';
// import Beer                   from './pages/Admin/Beer';
import License                from './pages/Admin/License';
//PubManager
import PubManager             from './pages/PubManager';
import SellStatus             from './pages/PubManager/SellStatus';
import PubManagerDetail       from './pages/PubManager/PubManagerDetail';
import Payment                from './pages/User/Payment';
import Point                  from './pages/User/Point';
import PointDetail            from './pages/User/Point/PointDetail';
import Liter                  from './pages/User/Liter';
import AdminSellerStatistic   from './pages/Seller/SellerStatistic/AdminSellerStatistic';
import SellerRemainBeer       from './pages/Seller/SellerRemainBeer';
import SellerRemainCom        from './pages/Seller/SellerRemainBeer/SellerRemainCom';
import ServerAdminManager     from './pages/Admin/ServerAdminManager';

export const routes = [
    {
        title: '맥주의 신',
        pathname: '/',
        component: BeerDashboard,
        exact: true,
        wrapper: NormalRoute
    },
    {
        title: '',
        pathname: '/user/findpassword',
        component: ResetPassword,
        exact: true,
        wrapper: NormalRoute,
    },
    {
        title: '나의 정보',
        pathname: '/user/review',
        component: Review,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '나의 정보',
        pathname: '/user/payment',
        component: Payment,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '나의 정보',
        pathname: '/user/point',
        component: Point,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '나의 정보',
        baseUrl: '/user/point',
        pathname: '/user/point/detail/:id',
        component: PointDetail,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '나의 정보',
        pathname: '/user/liter',
        component: Liter,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '맥주 정보',
        pathname: '/provider/beer',
        component: ProducerBeerInfo,
        exact: true,
        wrapper: PrivateRoute,
        hasSubMenu: true,
    },
    {
        title: '브루어리',
        pathname: '/provider/brewery',
        component: ProducerBrewerys,
        exact: true,
        wrapper: PrivateRoute,
        hasSubMenu: true,
    },
    {
        title: '이벤트 정보',
        pathname: '/provider/mypage/eventinfo',
        baseUrl: '/provider/mypage',
        component: ProducerEventinfo,
        exact: true,
        wrapper: PrivateRoute,
        hasSubMenu: true,
    },
    // Common
    {
        title: '모바일주문확인',
        pathname: '/mobile/order/info',
        component: CommonOrder,
        exact: true,
        wrapper: NormalRoute,
    },
    {
        title: '이용약관',
        pathname: '/license',
        component: CommonLicense,
        exact: true,
        wrapper: NormalRoute,
    },
    {
        title: '개인정보처리방침',
        pathname: '/privacy',
        component: CommonPrivacy,
        exact: true,
        wrapper: NormalRoute,
    },
    {
        title: '검색',
        pathname: '/search',
        component: Search,
        exact: true,
        wrapper: NormalRoute,
    },
    {
        title: '맥주',
        pathname: '/common/beers',
        component: BeerSearch,
        exact: true,
        wrapper: NormalRoute,
    },
    {
        title: '맥주',
        pathname: '/common/beers/detail/:id',
        component: BeerDetail,
        exact: true,
        wrapper: NormalRoute,
    },
    {
        title: '브루어리',
        pathname: '/common/brewerys',
        component: BrewerySearch,
        exact: true,
        wrapper: NormalRoute,
    },
    {
        title: '브루어리(상세보기)',
        pathname: '/common/brewerys/detail/:id',
        component: BreweryDetail,
        exact: true,
        wrapper: NormalRoute,
    },
    {
        title: '브루어리수입사(상세보기)',
        pathname: '/common/brewerys/abroad/detail/:id',
        component: AbroadBrewery,
        exact: true,
        wrapper: NormalRoute,
    },
    {
        title: '매장',
        pathname: '/common/pubs',
        component: PubSearch,
        exact: true,
        wrapper: NormalRoute,
    },
    {
        title: '브루어리',
        pathname: '/common/pubs/detail/:id',
        component: PubDetail,
        exact: true,
        wrapper: NormalRoute,
    },
    {
        title: '나의 정보',
        pathname: '/user/myinfo',
        component: MyInfo,
        exact: true,
        wrapper: NormalRoute,
    },
    // Seller
    {
        title: '매장정보',
        pathname: '/seller/pub',
        component: PubInfo,
        exact: true,
        wrapper: PrivateRoute,
    },
    {
        title: '메뉴',
        pathname: '/seller/menu',
        component: SellerMenu,
        exact: true,
        wrapper: PrivateRoute,
    },
    {
        title: 'QR코드등록',
        pathname: '/seller/qrcode',
        component: QRCodeRegister,
        exact: true,
        wrapper: PrivateRoute,
    },
    {
        title: '매출통계',
        pathname: '/seller/sales-statistics',
        component: SellerStatistic,
        exact: true,
        wrapper: PrivateRoute,
    },
    {
        title: '맥주잔량',
        pathname: '/seller/restbeer',
        component: SellerRemainBeer,
        exact: true,
        wrapper: PrivateRoute,
    },
    // Admin
    {
        title: '관리자정보',
        pathname: '/admin/myinfo',
        component: MyInfo,
        exact: true,
        wrapper: PrivateRoute,
    },
    {
        title: '등록현황',
        pathname: '/admin/mypage/registerstatus',
        baseUrl: '/admin/mypage',
        component: RegisterStatus,
        exact: true,
        wrapper: PrivateRoute,
    },
    {
        title: '공급자',
        pathname: '/admin/provider',
        component: ProviderStatus,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '공급자',
        baseUrl: '/admin/provider',
        pathname: '/admin/provider/providerdetail/:id',
        component: ProviderDetail,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '판매자',
        pathname: '/admin/seller',
        component: SellerStatus,
        exact: true,
        wrapper: PrivateRoute,
    },
    {
        title: '기능제한매장',
        pathname: '/admin/seller/blocked',
        component: BlockedSellerStatus,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '판매자(상세보기)',
        baseUrl: '/admin/seller',
        pathname: '/admin/seller/sellerdetail/:id',
        component: SellerDetail,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '판매자(상세보기)',
        pathname: '/seller/sellerdetail/:id/sellerstatistic',
        component: AdminSellerStatistic,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '판매자(상세보기)',
        pathname: '/seller/sellerdetail/:id/restbeer',
        component: SellerRemainCom,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '사용자',
        pathname: '/admin/normaluser',
        component: UserStatus,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '사용자(상세보기)',
        baseUrl: '/admin/normaluser',
        pathname: '/admin/normaluser/normaluserdetail/:id',
        component: UserDetail,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '매장관리자',
        pathname: '/admin/pubmanager',
        component: PubManagerStatus,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '매장관리자(상세보기)',
        baseUrl: '/admin/pubmanager',
        pathname: '/admin/pubmanager/pubmanagerdetail/:id',
        component: AdminPubManagerDetail,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '차단회원',
        pathname: '/admin/interception',
        component: Interception,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '차단회원(상세보기)',
        baseUrl: '/admin/interception',
        pathname: '/admin/interception/interceptiondetail/:id',
        component: InterceptionDetail,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '통계',
        baseUrl: '/admin/statistics',
        pathname: '/admin/statistics',
        component: Statistics,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '브루어리관리',
        pathname: '/admin/domesticbrewery',
        component: Domestic,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '수입사관리',
        pathname: '/admin/abroadbrewery',
        component: Abroad,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '맥주관리',
        pathname: '/admin/beerinfo',
        component: BeerInfo,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '서브 관리자',
        pathname: '/admin/subadmin',
        component: ServerAdminManager,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '이용약관',
        pathname: '/admin/license',
        component: License,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '광고관리',
        pathname: '/admin/advertise',
        component: Advertise,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '관리매장',
        pathname: '/pubmanager/brewery',
        component: PubManager,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '매출조회',
        pathname: '/pubmanager/sell-status',
        component: SellStatus,
        exact: true,
        wrapper: PrivateRoute,
    },

    {
        title: '관리매장(상세보기)',
        baseUrl: '/pubmanager/brewery',
        pathname: '/pubmanager/brewery/detail/:id',
        component: PubManagerDetail,
        exact: true,
        wrapper: PrivateRoute,
    },
    {
        title: '판매현황',
        pathname: '/seller/tapsell',
        component: TapSellList,
        exact: true,
        wrapper: PrivateRoute,
    },
    {
        title: '판매현황',
        pathname: '/provider/tapsell',
        component: TapSellProvider,
        exact: true,
        wrapper: PrivateRoute,
    },
    {
        title: '판매현황상세',
        pathname: '/provider/beerselldetail/:id',
        component: BeerSellDetail,
        exact: true,
        wrapper: PrivateRoute,
    },
];
