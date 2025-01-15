import { modifyData } from "@/utils";
import { reactive, ref } from "vue";
import ModuleAppOption from "./AppOption";
import ModuleUser from "./User";
import { cloneDeep } from "lodash";
import { v4 as uuidv4 } from "uuid";

// import { getIamgeByName } from "@/utils";

const BOOK_OPTION = {
  /** 是否首次打开 */
  first: true,
  /** 主题 */
  theme: "eyeProtect",
  themeLight: "eyeProtect",
  themeIndex: 1,
  turnPageType: "cover", // 'cover' | 'transition' | 'none'
  fontFamilyList: [
    {
      name: "黑体",
      value: "Arial",
    },
    {
      name: "草书",
      value: "Helvetica Neue",
    },
    {
      name: "等宽",
      value: "Helvetica",
    },
    {
      name: "仿宋",
      value: "sans-serif",
    },
  ],
  fontFamilyIndex: 0,
  /** 阅读器字体信息 */
  sizeInfo: {
    /** 标题字体大小 */
    title: 24,
    /** 段落字体大小 */
    p: 16,
    /** 标题行高 */
    tLineHeight: 24 * 1.5,
    /** 段落行高 */
    pLineHeight: 18 * 1.5,
    /** 标题边距 */
    titleMargin: 16,
    /** 左右边距 */
    lrPadding: 24,
    /** 上边距 */
    tPadding: 12,
    /** 下边距 */
    bPadding: 32,
    margin: 12,
    // 小说信息高度
    infoHeight: 30,
    // 小说信息边距
    infoMarginBottom: 10,
    // 页码高度
    pagginationHeight: 20,
  },
};

export class ModuleStore extends ModuleAppOption {
  constructor() {
    super();
    this.initBookOption();
    this.initBookShelves();
    this.initHistoryBookShelves();
    this.initHistorySearchList();
    this.initBookGroups();
    this.initTempData();
    this.initSourceMap();
  }

  /** 图片对象集 */
  get imageInfo() {
    // 需要用作背景图的可以用`import`引入
    return {
      iconWx: "/static/logo_wx.png",
      iconZfb: "/static/logo_zfb.png",
      logo: "/static/logo.png",
      defaultHead: "/static/default_head.png",
      noneData: "/static/none_data.png",
      iconArrowRight: "/static/arrow-right.png",
    };
  }

  /** 用户状态 */
  readonly user = new ModuleUser();

  /** 小说操作信息 */
  readonly bookOption = reactive(cloneDeep(BOOK_OPTION));
  /** 书架信息 */
  readonly bookShelves = reactive<BookShelves>({
    sort: "default",
    data: [],
  });
  /** 浏览历史 */
  readonly historyBookShelves = ref<BooksShelvesData[]>([]);
  /** 临时缓存 */
  readonly tempData = ref<TempDataReflect[]>([]);
  /** 搜索历史 */
  readonly historySearchList = ref<Array<string>>([]);
  // 分组列表
  readonly bookGroups = ref<Array<BookGrop>>([]);
  readonly sourceMap = ref<Array<SourceMap>>([]);

  /** 保存小说操作信息 */
  saveBookOption() {
    uni.setStorageSync("book-app-option", JSON.stringify(this.bookOption));
  }

  /** 获取小说操作信息 */
  private initBookOption() {
    const data = uni.getStorageSync("book-app-option");
    if (data) {
      modifyData(this.bookOption, JSON.parse(data));
    } else {
      uni.setStorageSync("book-app-option", JSON.stringify(this.bookOption));
    }
  }

  /** 清除小说操作信息 */
  removeBookOption() {
    modifyData(this.bookOption, cloneDeep(BOOK_OPTION));
    uni.removeStorageSync("book-app-option");
  }

  saveBookShelves() {
    uni.setStorageSync("__User_Bookshelves_Data__", JSON.stringify(this.bookShelves));
  }

  private initBookShelves() {
    const data = uni.getStorageSync("__User_Bookshelves_Data__");
    if (data) {
      const values: BookShelves = JSON.parse(data);
      values.data.forEach((book) => {
        if (book.uid.length !== 36) {
          // 矫正uid, 一些中途或者意外的退出可能导致uid错误
          book.uid = uuidv4();
        }
      });

      modifyData(this.bookShelves, values);
    }
  }

  removeBookShelves() {
    uni.removeStorageSync("__User_Bookshelves_Data__");
  }

  saveHistoryBookShelves() {
    uni.setStorageSync("__User_History_BookShelves_Data__", JSON.stringify(this.historyBookShelves.value));
  }
  modifyHistoryBookShelves(data: BooksShelvesData) {
    const idx = this.historyBookShelves.value.findIndex(
      (i) => i.bookName === data.bookName && i.author === data.author,
    );
    if (idx > -1) {
      this.historyBookShelves.value.splice(idx, 1);
    }
    this.historyBookShelves.value.unshift(data);

    if (this.historyBookShelves.value.length > 100) {
      this.historyBookShelves.value.splice(100);
    }
    this.saveHistoryBookShelves();
  }
  private initHistoryBookShelves() {
    const data = uni.getStorageSync("__User_History_BookShelves_Data__");
    if (data) {
      this.historyBookShelves.value = JSON.parse(data);
    }
  }

  removeHistoryBookShelves() {
    this.historyBookShelves.value = [];
    uni.removeStorageSync("__User_History_BookShelves_Data__");
  }

  saveBookGroups() {
    uni.setStorageSync("__User_Book_Groups__", JSON.stringify(this.bookGroups.value));
  }

  private initBookGroups() {
    const data = uni.getStorageSync("__User_Book_Groups__");
    if (data) {
      this.bookGroups.value = JSON.parse(data);
    }
  }
  removeBookGroups() {
    this.bookGroups.value = [];
    uni.removeStorageSync("__User_Book_Groups__");
  }

  saveSourceMap() {
    uni.setStorageSync("__User_Source_Map__", JSON.stringify(this.sourceMap.value));
  }

  private initSourceMap() {
    const data = uni.getStorageSync("__User_Source_Map__");
    if (data) {
      this.sourceMap.value = JSON.parse(data);
    }
  }
  removeSourceMap() {
    this.sourceMap.value = [];
    uni.removeStorageSync("__User_Source_Map__");
  }

  saveHistorySearchList() {
    uni.setStorageSync("__User_History_Search__", JSON.stringify(this.historySearchList.value));
  }

  private initHistorySearchList() {
    const data = uni.getStorageSync("__User_History_Search__");
    if (data) {
      this.historySearchList.value = JSON.parse(data);
    }
  }
  removeHistorySearchList() {
    this.historySearchList.value = [];
    uni.removeStorageSync("__User_History_Search__");
  }

  modifyTempData(params: { author: string; bookName: string; uid: string }) {
    const idx = this.bookShelves.data.findIndex((i) => i.uid === params.uid);
    // 如果书架里面存在书籍信息，移除映射
    if (idx > -1) {
      const ix = this.tempData.value.findIndex((i) => i.author === params.author && i.bookName === params.bookName);
      if (ix > -1) {
        this.tempData.value.splice(ix, 1);
      }
    } else {
      this.tempData.value.push(params);
    }
    this.saveTempData();
  }
  saveTempData() {
    uni.setStorageSync("__User_Temp_Data__", JSON.stringify(this.tempData.value));
  }
  private initTempData() {
    const data = uni.getStorageSync("__User_Temp_Data__");
    if (data) {
      const cache: TempDataReflect[] = JSON.parse(data);
      cache.forEach((i) => {
        if (i.uid) {
          uni.removeStorage({
            key: i.uid,
          });
        }
      });
    }
    this.removeTempData();
  }
  removeTempData() {
    this.tempData.value = [];
    uni.removeStorageSync("__User_Temp_Data__");
  }

  clearAllCache() {
    this.bookShelves.data.forEach((i) => {
      uni.removeStorage({
        key: i.uid,
      });
    });
    this.removeBookShelves();
    this.removeHistorySearchList();
    this.removeHistoryBookShelves();
    this.removeTempData();
    this.removeBookOption();
    this.removeSourceMap();
  }
}

/**
 * 状态管理模块
 * - `OOP`单例设计模式
 * - 参考 [你不需要`Vuex`](https://juejin.cn/post/6844903904023429128)
 */
const store = new ModuleStore();

export default store;
