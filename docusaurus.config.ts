import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Davy Page',
  tagline: 'Полезные записи Ивана Давыдова',
  favicon: 'img/favicon.ico',

  url: 'https://davy.page',
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/IDSaves/davy-page/blob/main/',
        },

        blog: {
          blogTitle: 'Блог',
          blogDescription: "Блог о Web'е",
          postsPerPage: 'ALL',
          blogSidebarTitle: 'Статьи',
          blogSidebarCount: 'ALL',
        },

        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    docs: {
      sidebar: {
        'autoCollapseCategories': true
      },
    },
    navbar: {
      hideOnScroll: true,
      title: 'Davy',
      logo: {
        alt: 'Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Записи',
        },
        {to: 'blog', label: 'Блог', position: 'left'},
        {
          href: 'https://github.com/IDSaves/davy-page',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Ссылки',
          items: [
            {
              label: 'Habr',
              href: 'https://habr.com/ru/users/Davydoff33/publications/articles/'
            },
            {
              label: 'Habr Карьера',
              href: 'https://career.habr.com/davydoff33'
            },
            {
              label: 'GitHub',
              href: 'https://github.com/IDSaves',
            },
          ],
        },
        {
          title: 'Контакты',
          items: [
            {
              label: 'Telegram',
              href: 'https://t.me/i_davydoff',
            },
          ],
        },
      ],
    },
    prism: {
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ["HCL", "JSON", "Bash", "nginx", "rust"]
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
