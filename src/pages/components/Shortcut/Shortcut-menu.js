import LANG from '../../../language';
export const links  = [
    {
        title: LANG('COMP_SHORTCUT_MENU_TITLE'),
        iconImage: '/assets/images/shortcut/root.png',
        className: 'root',
        childs: [
            {
                title: LANG('COMP_SHORTCUT_MENU_MYINFO'),
                url: '/account/myinfo',
                iconImage: '',
                className: 'account',
                iconClass: 'fa fa-user',
            },
            {
                title: LANG('COMP_SHORTCUT_MENU_ADMIN'),
                url: '/internal/news/read',
                iconImage: '/assets/images/shortcut/Shortlink_admin.png',
                className: 'admin',
            },
            {
                title: LANG('COMP_SHORTCUT_MENU_SUPPORT'),
                url: '/teaching-support/docmanage',
                iconImage: '/assets/images/shortcut/Shortlink_support.png',
                className: 'support',
            },
            {
                title: LANG('COMP_SHORTCUT_MENU_EVALUATION'),
                url: '/teaching-evaluation/achievement/subjectskill',
                iconImage: '/assets/images/shortcut/Shortlink_evaluation.png',
                className: 'evaluation',
            }
        ]
    }
  ];