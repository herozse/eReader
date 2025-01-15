const source = {
  local: [
    {
      name: "得奇小说网",
      origin: "https://www.deqixs.com",
      search: {
        pathname: "/tag/",
        method: "get",
        query: {
          key: {
            type: "query",
          },
        },
        rules: {
          wrapContainer: {
            selector: ".container .item",
          },
          infomation: {
            image: {
              selector: "a img",
            },
            bookName: {
              selector: ".itemtxt h3 a",
            },
            author: {
              selector: ".itemtxt p a",
              handler: {
                replace: "作者：",
              },
            },
            pathname: {
              selector: ".itemtxt h3 a",
            },
            categories: {
              selector: ".itemtxt p span",
              nthchild: 1,
            },
            latestChapter: {
              selector: ".itemtxt ul li a",
              nthchild: 0,
            },
          },
        },
      },
      catalogs: {
        rules: {
          pagination: {
            selector: "#pages .gr",
            fullpath: true,
          },
          wrapContainer: {
            selector: "#list ul li a",
          },
          infomation: {
            bookName: {
              selector: ".container .itemtxt h1 a",
              type: "element",
            },
            author: {
              selector: ".container .itemtxt p a",
              type: "element",
              handler: {
                replace: "作者：",
              },
            },
            image: {
              selector: ".container .item a img",
              type: "element",
              attr: "src",
            },
            categories: {
              selector: ".container .itemtxt p span",
              nthchild: 1,
              type: "element",
            },
            latestChapter: {
              selector: ".container ul li a",
              type: "element",
              nthchild: 0,
            },
            latestUpdateTime: {
              selector: ".container ul li i",
              type: "element",
              nthchild: 0,
            },
            description: {
              selector: ".container .des p",
              type: "element",
            },
          },
        },
      },
      content: {
        rules: {
          wrapContainer: {
            selector: ".container .con p",
          },
          pagination: {
            selector: ".prenext span a",
          },
          titleContainer: {
            selector: ".container .submenu h1",
          },
        },
      },
    },
    {
      name: "唐三中文网",
      origin: "http://www.xtangsanshu.com",
      search: {
        pathname: "/s.php",
        method: "get",
        query: {
          ie: "utf-8",
          s: {
            type: "date",
          },
          q: {
            type: "query",
          },
        },
        rules: {
          wrapContainer: {
            selector: ".so_list .bookbox",
          },
          infomation: {
            image: {
              selector: ".bookimg img",
              subPath: true,
            },
            bookName: {
              selector: ".bookname",
            },
            author: {
              selector: ".author",
              handler: {
                replace: "作者：",
              },
            },
            pathname: {
              selector: ".bookname a",
            },
            categories: {
              selector: ".cat",
              handler: {
                replace: "分类：",
              },
            },
            latestChapter: {
              selector: ".update a",
            },
          },
        },
      },
      catalogs: {
        rules: {
          wrapContainer: {
            selector: ".listmain dd a",
          },
          infomation: {
            bookName: {
              selector: 'meta[property="og:novel:book_name"]',
            },
            author: {
              selector: 'meta[property="og:novel:author"]',
            },
            image: {
              selector: 'meta[property="og:image"]',
            },
            categories: {
              selector: 'meta[property="og:novel:category"]',
            },
            latestChapter: {
              selector: 'meta[property="og:novel:latest_chapter_name"]',
            },
            latestUpdateTime: {
              selector: 'meta[property="og:novel:update_time"]',
            },
            description: {
              selector: 'meta[property="og:description"]',
            },
          },
        },
      },
      content: {
        rules: {
          wrapContainer: {
            selector: "#content",
          },
          titleContainer: {
            selector: ".content h1",
          },
        },
      },
    },
    {
      name: "顶点小说",
      origin: "https://www.dingdian911.com",
      search: {
        pathname: "/s.php",
        method: "post",
        queryType: "FormData",
        query: {
          submit: "",
          type: "articlename",
          s: {
            type: "query",
          },
        },
        rules: {
          wrapContainer: {
            selector: ".soulist ul li",
          },
          infomation: {
            bookName: {
              selector: ".name a",
            },
            author: {
              selector: ".zuo a",
            },
            pathname: {
              selector: ".name a",
            },
            categories: {
              selector: ".lei a",
            },
            latestChapter: {
              selector: ".jie a",
            },
          },
        },
      },
      catalogs: {
        rules: {
          wrapContainer: {
            selector: ".zhangjie ul li a",
          },
          infomation: {
            bookName: {
              selector: 'meta[property="og:novel:book_name"]',
            },
            author: {
              selector: 'meta[property="og:novel:author"]',
            },
            image: {
              selector: 'meta[property="og:image"]',
            },
            categories: {
              selector: 'meta[property="og:novel:category"]',
            },
            latestChapter: {
              selector: 'meta[property="og:novel:lastest_chapter_name"]',
            },
            latestUpdateTime: {
              selector: 'meta[property="og:novel:update_time"]',
            },
            description: {
              selector: 'meta[property="og:description"]',
            },
          },
        },
      },
      content: {
        rules: {
          wrapContainer: {
            selector: ".neirong #txt",
          },
          titleContainer: {
            selector: ".neirong h1",
          },
          lineBreak: "br",
        },
      },
    },
    {
      name: "笔趣阁",
      origin: "https://www.22biqu.com",
      search: {
        pathname: "/ss",
        method: "post",
        queryType: "FormData",
        query: {
          Submit: "搜索",
          searchkey: {
            type: "query",
          },
        },
        rules: {
          wrapContainer: {
            selector: ".txt-list li",
          },
          infomation: {
            bookName: {
              selector: ".s2 a",
            },
            author: {
              selector: ".s4",
            },
            pathname: {
              selector: ".s2 a",
            },
            categories: {
              selector: ".s1",
            },
            latestChapter: {
              selector: ".s3 a",
            },
          },
        },
      },
      catalogs: {
        rules: {
          pagination: {
            selector: ".index-container .index-container-btn",
          },
          wrapContainer: {
            selector: ".section-list li a",
          },
          infomation: {
            bookName: {
              selector: 'meta[property="og:novel:book_name"]',
            },
            author: {
              selector: 'meta[property="og:novel:author"]',
            },
            image: {
              selector: 'meta[property="og:image"]',
            },
            categories: {
              selector: 'meta[property="og:novel:category"]',
            },
            latestChapter: {
              selector: 'meta[property="og:novel:lastest_chapter_name"]',
            },
            latestUpdateTime: {
              selector: 'meta[property="og:novel:update_time"]',
            },
            description: {
              selector: 'meta[property="og:description"]',
            },
          },
        },
      },
      content: {
        rules: {
          wrapContainer: {
            selector: "#content p",
          },
          titleContainer: {
            selector: ".reader-main .title",
          },
          pagination: {
            selector: ".section-opt #next_url",
          },
        },
        handler: {
          replace: [
            {
              type: "Array",
              value: 0,
            },
          ],
        },
      },
    },
    {
      name: "叮当小说网",
      origin: "https://www.minixiaoshuow.com",
      search: {
        pathname: "/search.php",
        method: "get",
        query: {
          key: {
            type: "query",
          },
        },
        rules: {
          wrapContainer: {
            selector: ".s-b-list .secd-rank-list",
          },
          infomation: {
            image: {
              selector: "dl dt .lazyimg",
              attr: "data-original",
            },
            bookName: {
              selector: "dl dd .bigpic-book-name",
            },
            author: {
              selector: "dl dd p a",
              nthchild: 0,
            },
            pathname: {
              selector: "dl dt a",
            },
            categories: {
              selector: "dl dd p a",
              nthchild: 1,
            },
            latestChapter: {
              selector: "dl dd p .red",
            },
          },
        },
      },
      catalogs: {
        rules: {
          redirect: {
            selector: "#content-tab .header .tab a",
            nthchild: 1,
          },
          wrapContainer: {
            selector: ".mod ul li a",
          },
          infomation: {
            bookName: {
              selector: 'meta[property="og:novel:book_name"]',
            },
            author: {
              selector: 'meta[property="og:novel:author"]',
            },
            image: {
              selector: 'meta[property="og:image"]',
            },
            categories: {
              selector: 'meta[property="og:novel:category"]',
            },
            latestChapter: {
              selector: 'meta[property="og:novel:latest_chapter_name"]',
            },
            latestUpdateTime: {
              selector: 'meta[property="og:novel:update_time"]',
            },
            description: {
              selector: 'meta[property="og:description"]',
            },
          },
        },
      },
      content: {
        rules: {
          wrapContainer: {
            selector: "#txt dd p",
          },
          titleContainer: {
            selector: "#chapter-name h2",
          },
        },
      },
    },
    {
      name: "速读谷",
      origin: "https://www.sudugu.com",
      search: {
        pathname: "/i/sor.aspx",
        method: "get",
        query: {
          key: {
            type: "query",
          },
        },
        rules: {
          wrapContainer: {
            selector: ".container .item",
          },
          infomation: {
            image: {
              selector: "a img",
              subPath: true,
            },
            bookName: {
              selector: ".itemtxt h3",
            },
            author: {
              selector: ".itemtxt p a",
              handler: {
                replace: "作者：",
              },
            },
            pathname: {
              selector: ".itemtxt h3 a",
            },
            categories: {
              selector: ".itemtxt p span",
              nthchild: 1,
            },
            latestChapter: {
              selector: ".itemtxt ul li a",
              nthchild: 0,
            },
          },
        },
      },
      catalogs: {
        rules: {
          pagination: {
            selector: "#pages .gr",
            fullpath: true,
          },
          wrapContainer: {
            selector: "#list ul li a",
          },
          infomation: {
            bookName: {
              selector: ".container .itemtxt h1 a",
              type: "element",
            },
            author: {
              selector: ".container .itemtxt p a",
              type: "element",
              handler: {
                replace: "作者：",
              },
            },
            image: {
              selector: ".container .item a img",
              type: "element",
              attr: "src",
              subPath: true,
            },
            categories: {
              selector: ".container .itemtxt p span",
              nthchild: 1,
              type: "element",
            },
            latestChapter: {
              selector: ".container ul li a",
              type: "element",
              nthchild: 0,
            },
            latestUpdateTime: {
              selector: ".container ul li i",
              type: "element",
              nthchild: 0,
            },
            description: {
              selector: ".container .des p",
              type: "element",
            },
          },
        },
      },
      content: {
        rules: {
          wrapContainer: {
            selector: ".container .con p",
          },
          pagination: {
            selector: ".prenext span a",
          },
          titleContainer: {
            selector: ".container .submenu h1",
          },
        },
      },
    },
    {
      name: "灵域小说网",
      origin: "https://www.lingyutxt5.com",
      search: {
        pathname: "/search.php",
        method: "get",
        query: {
          keyword: {
            type: "query",
          },
        },
        rules: {
          wrapContainer: {
            selector: "#main .novelslist2 ul li",
          },
          infomation: {
            bookName: {
              selector: ".s2 a",
            },
            author: {
              selector: ".s4 a",
            },
            pathname: {
              selector: ".s2 a",
            },
            latestChapter: {
              selector: ".s3 a",
            },
          },
        },
      },
      catalogs: {
        rules: {
          wrapContainer: {
            selector: ".box_con #list dl dd a",
          },
          infomation: {
            bookName: {
              selector: 'meta[property="og:novel:book_name"]',
            },
            author: {
              selector: 'meta[property="og:novel:author"]',
            },
            image: {
              selector: 'meta[property="og:image"]',
            },
            categories: {
              selector: 'meta[property="og:novel:category"]',
            },
            latestChapter: {
              selector: 'meta[property="og:novel:latest_chapter_name"]',
            },
            latestUpdateTime: {
              selector: 'meta[property="og:novel:update_time"]',
            },
            description: {
              selector: 'meta[property="og:description"]',
            },
          },
        },
      },
      content: {
        rules: {
          lineBreak: "br",
          wrapContainer: {
            selector: "#content",
          },
          titleContainer: {
            selector: ".content_read .bookname h1",
          },
        },
      },
    },
    {
      name: "笔趣E",
      origin: "https://www.biqubao10.com",
      search: {
        pathname: "/search.php",
        method: "get",
        query: {
          keyword: {
            type: "query",
          },
        },
        rules: {
          wrapContainer: {
            selector: ".result-list .result-item",
          },
          infomation: {
            image: {
              selector: ".result-game-item-pic a img",
              subPath: true,
            },
            bookName: {
              selector: ".result-game-item-detail .result-item-title a",
            },
            author: {
              selector: ".result-game-item-info .result-game-item-info-tag",
              nthchild: 0,
              handler: {
                replace: "作者：",
              },
            },
            pathname: {
              selector: ".result-game-item-detail .result-item-title a",
            },
            categories: {
              selector: ".result-game-item-info .result-game-item-info-tag",
              nthchild: 1,
              handler: {
                replace: "类型：",
              },
            },
            latestChapter: {
              selector: ".result-game-item-info-tag-item",
            },
          },
        },
      },
      catalogs: {
        rules: {
          wrapContainer: {
            selector: "#list dl dd a",
          },
          infomation: {
            bookName: {
              selector: 'meta[property="og:novel:book_name"]',
            },
            author: {
              selector: 'meta[property="og:novel:author"]',
            },
            image: {
              selector: 'meta[property="og:image"]',
            },
            categories: {
              selector: 'meta[property="og:novel:category"]',
            },
            latestChapter: {
              selector: 'meta[property="og:novel:latest_chapter_name"]',
            },
            latestUpdateTime: {
              selector: 'meta[property="og:novel:update_time"]',
            },
            description: {
              selector: 'meta[property="og:description"]',
            },
          },
        },
      },
      content: {
        rules: {
          lineBreak: "br",
          wrapContainer: {
            selector: "#content",
          },
          titleContainer: {
            selector: ".bookname h1",
          },
        },
      },
    },
    {
      name: "来读读小说",
      origin: "https://www.xlaidudu.info",
      search: {
        pathname: "/read/search/",
        method: "post",
        queryType: "FormData",
        query: {
          searchkey: {
            type: "query",
          },
        },
        rules: {
          wrapContainer: {
            selector: ".so_list .bookbox",
          },
          infomation: {
            image: {
              selector: ".bookimg img",
              subPath: true,
            },
            bookName: {
              selector: ".bookinfo .bookname a",
            },
            author: {
              selector: ".bookinfo .author",
              handler: {
                replace: "作者：",
              },
            },
            pathname: {
              selector: ".bookinfo .bookname a",
            },
            categories: {
              selector: ".bookinfo .cat",
              handler: {
                replace: "分类：",
              },
            },
            latestChapter: {
              selector: ".bookinfo .update a",
            },
          },
        },
      },
      catalogs: {
        rules: {
          wrapContainer: {
            selector: ".listmain dl dd a",
          },
          infomation: {
            bookName: {
              selector: 'meta[property="og:novel:book_name"]',
            },
            author: {
              selector: 'meta[property="og:novel:author"]',
            },
            image: {
              selector: 'meta[property="og:image"]',
            },
            categories: {
              selector: 'meta[property="og:novel:category"]',
            },
            latestChapter: {
              selector: 'meta[property="og:novel:latest_chapter_name"]',
            },
            latestUpdateTime: {
              selector: 'meta[property="og:novel:update_time"]',
            },
            description: {
              selector: 'meta[property="og:description"]',
            },
          },
        },
      },
      content: {
        rules: {
          lineBreak: "br",
          wrapContainer: {
            selector: "#content",
          },
          titleContainer: {
            selector: ".content h1",
          },
        },
      },
    },
    {
      name: "八一中文网",
      origin: "http://www.zwduxs.com",
      search: {
        pathname: "/modules/article/search.php",
        method: "post",
        queryType: "FormData",
        query: {
          searchtype: "articlename",
          searchkey: {
            type: "query",
          },
        },
        rules: {
          wrapContainer: {
            selector: ".grid #nr",
          },
          infomation: {
            bookName: {
              selector: ".odd a",
            },
            author: {
              selector: ".odd",
              nthchild: 1,
            },
            pathname: {
              selector: ".odd a",
              handler: {
                replace: "http://www.zwduxs.com",
              },
            },
            latestChapter: {
              selector: ".even a",
            },
          },
        },
      },
      catalogs: {
        rules: {
          wrapContainer: {
            selector: "#list dl dd a",
          },
          infomation: {
            bookName: {
              selector: 'meta[property="og:novel:book_name"]',
            },
            author: {
              selector: 'meta[property="og:novel:author"]',
            },
            image: {
              selector: 'meta[property="og:image"]',
            },
            categories: {
              selector: 'meta[property="og:novel:category"]',
            },
            latestChapter: {
              selector: 'meta[property="og:novel:latest_chapter_name"]',
            },
            latestUpdateTime: {
              selector: 'meta[property="og:novel:update_time"]',
            },
            description: {
              selector: 'meta[property="og:description"]',
            },
          },
        },
      },
      content: {
        rules: {
          lineBreak: "br",
          wrapContainer: {
            selector: "#content",
          },
          titleContainer: {
            selector: ".bookname h1",
          },
        },
      },
    },
    {
      name: "新笔趣阁",
      origin: "https://www.aishangba4.com",
      search: {
        pathname: "/search.php",
        method: "get",
        query: {
          keyword: {
            type: "query",
          },
        },
        rules: {
          wrapContainer: {
            selector: ".result-list .result-item",
          },
          infomation: {
            image: {
              selector: ".result-game-item-pic a img",
              subPath: true,
            },
            bookName: {
              selector: ".result-game-item-detail .result-item-title a",
            },
            author: {
              selector: ".result-game-item-info .result-game-item-info-tag",
              nthchild: 0,
              handler: {
                replace: "作者：",
              },
            },
            pathname: {
              selector: ".result-game-item-detail .result-item-title a",
            },
            categories: {
              selector: ".result-game-item-info .result-game-item-info-tag",
              nthchild: 1,
              handler: {
                replace: "类型：",
              },
            },
            latestChapter: {
              selector: ".result-game-item-info-tag-item",
            },
          },
        },
      },
      catalogs: {
        rules: {
          wrapContainer: {
            selector: "#list dl dd a",
          },
          infomation: {
            bookName: {
              selector: 'meta[property="og:novel:book_name"]',
            },
            author: {
              selector: 'meta[property="og:novel:author"]',
            },
            image: {
              selector: 'meta[property="og:image"]',
            },
            categories: {
              selector: 'meta[property="og:novel:category"]',
            },
            latestChapter: {
              selector: 'meta[property="og:novel:latest_chapter_name"]',
            },
            latestUpdateTime: {
              selector: 'meta[property="og:novel:update_time"]',
            },
            description: {
              selector: 'meta[property="og:description"]',
            },
          },
        },
      },
      content: {
        rules: {
          lineBreak: "br",
          wrapContainer: {
            selector: "#content",
          },
          titleContainer: {
            selector: ".bookname h1",
          },
        },
      },
    },
    {
      name: "乐文小说网",
      origin: "http://www.lwshuku.info",
      search: {
        pathname: "/plus/search.php",
        method: "get",
        query: {
          s: "00000",
          q: {
            type: "query",
          },
        },
        rules: {
          wrapContainer: {
            selector: ".so_list .bookbox",
          },
          infomation: {
            image: {
              selector: ".bookimg img",
            },
            bookName: {
              selector: ".bookinfo .bookname a",
            },
            author: {
              selector: ".bookinfo .author",
              handler: {
                replace: "作者：",
              },
            },
            pathname: {
              selector: ".bookinfo .bookname a",
            },
            categories: {
              selector: ".bookinfo .cat",
              handler: {
                replace: "分类：",
              },
            },
            latestChapter: {
              selector: ".bookinfo .update a",
            },
          },
        },
      },
      catalogs: {
        rules: {
          wrapContainer: {
            selector: ".panel-body .list-charts li a",
          },
          infomation: {
            bookName: {
              selector: 'meta[property="og:novel:book_name"]',
            },
            author: {
              selector: 'meta[property="og:novel:author"]',
            },
            image: {
              selector: 'meta[property="og:image"]',
            },
            categories: {
              selector: 'meta[property="og:novel:category"]',
            },
            latestChapter: {
              selector: 'meta[property="og:novel:latest_chapter_name"]',
            },
            latestUpdateTime: {
              selector: 'meta[property="og:novel:update_time"]',
            },
            description: {
              selector: 'meta[property="og:description"]',
            },
          },
        },
      },
      content: {
        rules: {
          lineBreak: "br",
          wrapContainer: {
            selector: ".content-body",
          },
          titleContainer: {
            selector: ".panel-heading",
          },
        },
      },
    },
  ],
};
export default source;
