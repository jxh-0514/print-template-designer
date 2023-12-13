/* eslint-disable */
import {
  StyledBarCode,
  StyledCircle,
  StyledComplexTable,
  StyledImage,
  StyledLine,
  StyledQRCode,
  StyledRect,
  StyledSimpleTable,
  StyledSimpleText,
  StyledStar,
  StyledText
} from '@/components/PageComponents/style'
import { CONFIG } from '@/components/Viewer/viewer-constant'
import { RenderUtil } from '@/components/Viewer/render-util'
import Vue from 'vue'
import { AutoTable } from '@/components/Viewer/auto-table'
import generateID from '@/utils/generateID'
import { AutoSplitText } from '@/components/Viewer/auto-split-text'

// 缩放比率
const { COMMON_SCALE, AUTO_PAGE_COMPONENT } = CONFIG

const componentToStyled = {
  // 定义一个对象，用于存储组件和样式之间的映射关系
  RoyText: StyledText,
  RoyTextIn: StyledText,
  RoySimpleText: StyledSimpleText,
  RoySimpleTextIn: StyledSimpleText,
  RoyCircle: StyledCircle,
  RoyLine: StyledLine,
  RoyRect: StyledRect,
  RoyStar: StyledStar,
  RoySimpleTable: StyledSimpleTable,
  RoyComplexTable: StyledComplexTable,
  RoyImage: StyledImage,
  RoyQRCode: StyledQRCode,
  RoyBarCode: StyledBarCode
}

const componentToClassName = {
  // RoyText：渲染的 RoyText 类名
  RoyText: 'rendered-roy-text',
  // RoyTextIn：渲染的 RoyTextIn 类名
  RoyTextIn: 'rendered-roy-text-in',
  // RoySimpleText：渲染的 RoySimpleText 类名
  RoySimpleText: 'rendered-roy-simple-text',
  // RoySimpleTextIn：渲染的 RoySimpleTextIn 类名
  RoySimpleTextIn: 'rendered-roy-simple-text-in',
  // RoyCircle：渲染的 RoyCircle 类名
  RoyCircle: 'rendered-roy-circle',
  // RoyLine：渲染的 RoyLine 类名
  RoyLine: 'rendered-roy-line',
  // RoyRect：渲染的 RoyRect 类名
  RoyRect: 'rendered-roy-rect',
  // RoyStar：渲染的 RoyStar 类名
  RoyStar: 'rendered-roy-star',
  // RoySimpleTable：渲染的 RoySimpleTable 类名
  RoySimpleTable: 'rendered-roy-simple-table',
  // RoyComplexTable：渲染的 RoyComplexTable 类名
  RoyComplexTable: 'rendered-roy-complex-table',
  // RoyImage：渲染的 RoyImage 类名
  RoyImage: 'rendered-roy-image',
  // RoyQRCode：渲染的 RoyQRCode 类名
  RoyQRCode: 'rendered-roy-qrcode',
  // RoyBarCode：渲染的 RoyBarCode 类名
  RoyBarCode: 'rendered-roy-barcode'
}

class BasePageGenerator {
  constructor({ renderElements, pagerConfig, dataSet, dataSource }) {
    // 页面组件
    this.renderElements = renderElements
    // 页面配置信息
    this.pagerConfig = pagerConfig
    // 数据
    this.dataSet = dataSet
    // 数据源信息
    this.dataSource = dataSource
    const {
      pageWidth,
      pageHeight,
      pageMarginBottom,
      pageMarginTop,
      pageDirection,
      pageLayout
    } = pagerConfig
    // 页面宽度(mm)
    this.pageWidth =
      (pageDirection === 'p' ? pageWidth : pageHeight) * COMMON_SCALE
    // 页面高度(mm)
    this.pageHeight =
      (pageDirection === 'p' ? pageHeight : pageWidth) * COMMON_SCALE
    // 真实的下边距(px)
    this.realPageMarginBottom = pageMarginBottom * COMMON_SCALE
    // 真实的上边距(px)
    this.realPageMarginTop = pageMarginTop * COMMON_SCALE
    // 页面最大使用高度
    this.maxPageUseHeight = this.pageHeight - this.realPageMarginBottom
    // 页面布局方式
    this.pageLayout = pageLayout
    const { background, color, fontSize, fontFamily, lineHeight } =
      this.pagerConfig
    // 页面样式
    this.pageDefaultStyle = `
      width: ${this.pageWidth}px;
      height: ${this.pageHeight}px;
      background: ${background};
      color: ${color};
      font-size: ${fontSize}pt;
      font-family: ${fontFamily};
      line-height: ${lineHeight};
      position: relative;
      overflow: hidden;
    `
    // 所有页（key为页码）
    this.pages = {}

    if (new.target === undefined) {
      throw new Error('请通过new来新建示例')
    }
    if (new.target === BasePageGenerator) {
      throw new Error('基类不能被实例')
    }
    console.log('[BasePageGenerator]当前调用适配器：', this.constructor.name)
  }

  createTempPage(pageIndex = 0) {
    let element = null
    return {
      pageIndex,
      init: () => {
        // 如果存在，则移除
        if (element !== null) {
          if (document.body.contains(element)) {
            document.body.removeChild(element)
          }
          element = null
        }
        // 创建一个div
        element = document.createElement('div')
        element.style = `
          ${this.pageDefaultStyle}
          top: 100vh;
          left: 0;
          position: fixed;
        `
      },
      mount: async () => {
        // 如果元素不存在，则返回
        if (element === null) {
          console.info('element has been removed.')
          return
        }
        // 将元素添加到body中
        document.body.appendChild(element)
        // 等待渲染完成
        await RenderUtil.wait()
      },
      appendChild: async (childEle) => {
        // 如果元素不存在，则返回
        if (element === null) {
          console.info('element has been removed.')
          return
        }
        // 将子元素添加到元素中
        element.appendChild(childEle)
        // 等待渲染完成
        await RenderUtil.wait()
      },
      appendHTML: async (html) => {
        // 如果元素不存在，则返回
        if (element === null) {
          console.info('element has been removed.')
          return
        }
        // 将html添加到元素中
        element.insertAdjacentHTML('beforeend', html)
        // 等待渲染完成
        await RenderUtil.wait()
      },
      unmount: () => {
        // 如果元素存在，则从body中移除
        if (document.body.contains(element)) {
          document.body.removeChild(element)
        }
      },
      remove: () => {
        // 如果元素存在，则从body中移除
        if (element === null) {
          console.info('element has been removed.')
          return
        }
        if (document.body.contains(element)) {
          document.body.removeChild(element)
        }
        element = null
      },
      removeChild: (childEle) => {
        // 如果元素存在，则从元素中移除子元素
        if (element === null) {
          console.info('element has been removed.')
          return
        }
        element.removeChild(childEle)
      },
      getPageHTML: () => {
        // 如果元素存在，则返回html
        if (element === null) {
          console.info('element has been removed.')
          return ''
        }
        return `
          <div
            id="${generateID()}"
            class="roy-preview-page"
            style="${this.pageDefaultStyle}"
          >
            ${element.innerHTML}
          </div>
        `
      }
    }
  }

  getPage(pageNumber = 1) {
    // 如果当前页不存在，则创建一个临时页
    if (!this.pages[pageNumber]) {
      const newPage = this.createTempPage(pageNumber)
      // 初始化临时页
      newPage.init()
      // 将临时页添加到pages中
      this.pages[Number(pageNumber)] = newPage
    }
    // 返回当前页
    return this.pages[pageNumber]
  }

  getPageHTML() {
    // 将pages中的页码排序
    const pageNums = Object.keys(this.pages).sort((a, b) => {
      return +a - +b
    })
    let pageContent = ''
    // 遍历pages中的页码
    for (let pageNum of pageNums) {
      // 获取当前页
      let page = this.pages[pageNum]
      // 获取当前页的html
      pageContent += page.getPageHTML()
      // 删除当前页
      page.remove()
    }
    // 返回html
    return pageContent
  }

  // async函数，用于渲染页面
  async render() {
    // 定义三个数组，用于存放不同的元素
    let uniqueElements = []
    let repeatElements = []
    let fixedElements = []
    // 定义一个对象，用于存放元素的位置信息
    let elementIdToPosition = {}
    // 定义一个对象，用于存放元素的位置信息
    let yPixelSortMap = {}
    // 遍历渲染元素数组
    for (let i = 0; i < this.renderElements.length; i++) {
      const curElement = this.renderElements[i]
      const { id } = curElement
      const { ty } = curElement.position || { ty: Infinity }
      curElement.index = i
      // 将元素的位置信息存入对象中
      elementIdToPosition[id] = curElement.position || {}
      // 将元素的位置信息存入对象中
      yPixelSortMap[Number(ty)] = [...(yPixelSortMap[ty] || []), curElement]
    }
    // 对yPixelSortMap对象进行排序
    Object.keys(yPixelSortMap)
      .sort((a, b) => {
        return +a - +b
      })
      .forEach((yPixel) => {
        yPixelSortMap[yPixel].forEach((comp) => {
          const {
            style: { elementPosition = 'default' }
          } = comp
          // 将元素的位置信息存入不同的数组中
          if (elementPosition === 'default') {
            uniqueElements.push(comp)
          } else if (elementPosition === 'fixed') {
            fixedElements.push(comp)
          } else if (elementPosition === 'repeated') {
            repeatElements.push(comp)
          }
        })
      })
    // 渲染唯一元素
    await this.renderUniqueElement(uniqueElements)
    // 渲染固定元素
    await this.renderFixedElement(fixedElements)
    // 最后渲染重复元素
    await this.renderRepeatElement(repeatElements)
    // 返回页面HTML
    return this.getPageHTML()
  }

  async renderUniqueElement(uniqueElements) {
    // 遍历uniqueElements数组，对每一个元素进行渲染
    for (let i = 0; i < uniqueElements.length; i++) {
      const curElement = uniqueElements[i]
      const { component } = curElement
      // 调用render函数，渲染当前元素
      await this[`render${component}`]({ component: curElement })
    }
  }

  async renderRepeatElement(repeatElements) {
    // 获取pages数组，用于渲染重复元素
    let pages = Object.keys(this.pages)
    // 遍历repeatElements数组，对每一个元素进行渲染
    for (let i = 0; i < repeatElements.length; i++) {
      const curElement = repeatElements[i]
      const { component } = curElement
      // 遍历pages数组，对每一个页面进行渲染
      pages.map(async (page) => {
        await this[`render${component}`]({
          component: curElement,
          pageNumber: page
        })
      })
    }
  }

  async renderFixedElement(fixedElements, pageNum = 1) {
    // 遍历fixedElements数组，对每一个元素进行渲染
    for (let i = 0; i < fixedElements.length; i++) {
      const curElement = fixedElements[i]
      const { component } = curElement
      // 调用render函数，渲染当前元素
      await this[`render${component}`]({
        component: curElement,
        pageNumber: pageNum
      })
    }
  }

  generateRoySimpleText(component) {
    // 获取组件的index、propValue、bindValue和style
    const { index, propValue, bindValue, style } = component
    // 声明一个变量afterPropValue，用来存储转换后的propValue
    let afterPropValue = propValue
    // 如果bindValue存在，则获取bindValue中的field，并使用RenderUtil.getDataConvertedByDataSource方法将数据转换为指定格式
    if (bindValue) {
      const { field } = bindValue
      afterPropValue = RenderUtil.getDataConvertedByDataSource(
        this.dataSet[field],
        field,
        this.dataSource
      )
    }
    // 使用this.generateNewElementWithStyledComponent方法生成新的元素，并将afterPropValue作为innerHTML
    let newElement = this.generateNewElementWithStyledComponent(
      component,
      index
    )
    newElement.innerHTML = `<div class="roy-simple-text-inner">${afterPropValue}</div>`
    // 返回新的元素和style
    return {
      element: newElement,
      style
    }
  }

  // 生成RoyLine组件
  generateRoyLine(component) {
    // 获取组件的index和style
    const { index, style } = component
    // 生成一个新的元素，并使用样式组件
    let newElement = this.generateNewElementWithStyledComponent(
      component,
      index
    )
    // 返回新的元素和样式
    return {
      element: newElement,
      style
    }
  }

  // 生成RoyRect组件
  generateRoyRect(component) {
    const { index, style } = component
    let newElement = this.generateNewElementWithStyledComponent(
      component,
      index
    )
    return {
      element: newElement,
      style
    }
  }

  // 生成RoyQRCode组件
  generateRoyQRCode(component) {
    const { index, style } = component
    // 生成一个新的元素，使用样式组件
    let newElement = this.generateNewElementWithStyledComponent(
      component,
      index
    )
    // 创建一个图片元素
    let img = document.createElement('img')
    // 设置图片的src属性
    img.src = component.propValue
    // 设置图片的alt属性
    img.alt = component.text
    // 设置图片的宽度
    img.style.width = '100%'
    // 设置图片的高度
    img.style.height = '100%'
    // 将图片元素添加到新的元素中
    newElement.appendChild(img)
    // 返回新的元素和样式
    return {
      element: newElement,
      style
    }
  }

  // 生成RoyBarCode组件
  generateRoyBarCode(component) {
    // 获取传入的组件参数
    const { index, style, includeText, colorDark } = component
    // 生成一个新的元素
    let newElement = this.generateNewElementWithStyledComponent(
      component,
      index
    )
    // 创建一个图片元素
    let img = document.createElement('img')
    // 设置图片的src属性
    img.src = component.propValue
    // 设置图片的alt属性
    img.alt = component.text
    // 设置图片的宽度
    img.style.width = '100%'
    // 设置图片的高度
    img.style.height = includeText ? 'calc(100% - 14px)' : '100%'
    // 将图片添加到新的元素中
    newElement.appendChild(img)
    // 判断是否包含文本
    if (includeText) {
      // 创建一个div元素
      let text = document.createElement('div')
      // 设置div的文本内容
      text.innerText = component.text
      // 设置div的高度
      text.style.height = '14px'
      // 设置div的宽度
      text.style.width = '100%'
      // 设置div的字体大小
      text.style.fontSize = '12px'
      // 设置div的对齐方式
      text.style.textAlign = 'center'
      // 设置div的位置
      text.style.position = 'absolute'
      // 设置div的底部距离
      text.style.bottom = '0'
      // 设置div的左边距
      text.style.left = '0'
      // 设置div的文本颜色
      text.style.color = colorDark
      // 设置div的背景颜色
      text.style.background = style.background
      // 将div添加到新的元素中
      newElement.appendChild(text)
    }
    // 返回新的元素和样式
    return {
      element: newElement,
      style
    }
  }

  generateRoyCircle(component) {
    // 获取组件的index和style
    const { index, style } = component
    // 生成一个新的元素，并且使用样式组件
    let newElement = this.generateNewElementWithStyledComponent(
      component,
      index
    )
    // 返回新的元素和style
    return {
      element: newElement,
      style
    }
  }

  generateRoyStar(component) {
    // 获取组件的index和style
    const { index, style } = component
    // 生成新的元素，并使用styled组件的样式
    let newElement = this.generateNewElementWithStyledComponent(
      component,
      index
    )
    // 创建一个新的span元素
    const star = document.createElement('span')
    // 为span元素添加class，并设置样式
    star.classList.add(...['iconfont', 'roy-star-icon', style.icon])
    // 将span元素添加到新的元素中
    newElement.appendChild(star)
    // 返回新的元素和样式
    return {
      element: newElement,
      style
    }
  }

  generateRoyImage(component) {
    // 解构出component中的index和style
    const { index, style } = component
    // 调用generateNewElementWithStyledComponent函数，生成新的元素
    let newElement = this.generateNewElementWithStyledComponent(
      component,
      index
    )
    // 创建一个img标签
    let img = document.createElement('img')
    // 设置img标签的src和alt属性
    img.src = component.src
    img.alt = component.title
    // 将img标签添加到新的元素中
    newElement.appendChild(img)
    // 返回新的元素和style
    return {
      element: newElement,
      style
    }
  }

  generateRoyText(component, zIndex, parentElement = null) {
    const { propValue, style } = component
    let outerStyle = style
    // 替换文本中的数据源
    const afterPropValue = RenderUtil.replaceTextWithDataSource(
      propValue,
      this.dataSet,
      this.dataSource
    )
    let rootElement = null
    // 生成新的元素
    let newElement = this.generateNewElementWithStyledComponent(
      component,
      zIndex
    )
    // 设置新的元素的位置
    newElement.style.transform = 'none'
    // newElement.style.border = 'none'
    // 设置新的元素的内容
    newElement.innerHTML = `<div class="roy-text-inner">${afterPropValue}</div>`
    newElement.style.height = 'auto'
    // 如果存在父元素，则设置新的元素的位置
    if (parentElement) {
      newElement.style.position = 'relative'
      newElement.style.width = '100%'
      newElement.style.height = 'auto'
      newElement.style.left = 0
      newElement.style.top = 0
      outerStyle = parentElement.style
      rootElement = this.generateNewElementWithStyledComponent(
        parentElement,
        zIndex
      )
      rootElement.appendChild(newElement)
      // 富文本高度自动给，然后走分页逻辑
      rootElement.style.height = 'auto'
    } else {
      rootElement = newElement
    }
    return {
      element: rootElement,
      innerElement: newElement,
      style: outerStyle,
      innerStyle: style
    }
  }

  generateRoySimpleTable(component, zIndex = 0, parentElement = null) {
    // 创建一个AutoTable实例
    let autoTable = new AutoTable({
      type: component.component,
      propValue: component.propValue,
      dataSource: this.dataSource,
      dataSet: this.dataSet
    })
    // 获取组件的样式
    const { style } = component
    // 定义外部样式
    let outerStyle = style
    // 获取表格的html
    let tableHtml = autoTable.getOriginTableItem()
    // 定义根元素
    let rootElement
    // 生成新的元素
    let newElement = this.generateNewElementWithStyledComponent(
      component,
      zIndex
    )
    // 添加表格html
    newElement.innerHTML = tableHtml
    // 设置宽度为auto
    newElement.style.width = 'auto'
    // 如果有父元素
    if (parentElement) {
      // 设置相对定位
      newElement.style.position = 'relative'
      // 设置宽度为100%
      newElement.style.width = '100%'
      // 设置高度为auto
      newElement.style.height = 'auto'
      // 设置左边距为0
      newElement.style.left = 0
      // 设置上边距为0
      newElement.style.top = 0
      // 获取父元素的样式
      outerStyle = parentElement.style
      // 生成新的元素
      rootElement = this.generateNewElementWithStyledComponent(
        parentElement,
        zIndex
      )
      // 设置宽度为auto
      rootElement.style.width = 'auto'
      // 将新元素添加到父元素中
      rootElement.appendChild(newElement)
    } else {
      // 否则，将新元素设置为根元素
      rootElement = newElement
    }
    // 返回根元素、内部元素、外部样式和内部样式
    return {
      element: rootElement,
      innerElement: newElement,
      style: outerStyle,
      innerStyle: style
    }
  }

  generateRoyDataTable(component, zIndex) {
    // 获取组件名称和bodyDataTableElement属性值
    const {
      component: componentName,
      propValue: { bodyDataTableElement }
    } = component
    // 创建AutoTable实例
    let autoTable = new AutoTable({
      type: componentName,
      propValue: bodyDataTableElement,
      dataSource: this.dataSource,
      dataSet: this.dataSet
    })
    // 获取tableItem
    let tableItem = autoTable.getOriginTableItem()
    // 生成新的元素
    let newElement = this.generateNewElementWithStyledComponent(
      component,
      zIndex
    )
    // 获取tableStart, tableHead, tableBody, tableEnd
    const { tableStart, tableHead, tableBody, tableEnd } = tableItem
    // 设置新元素的innerHTML
    newElement.innerHTML = `${tableStart}${tableHead}${tableBody}${tableEnd}`
    // 返回新元素和tableStart, tableEnd
    return {
      newElement,
      tableStart,
      tableEnd
    }
  }

  generateNewElementWithStyledComponent(element, zIndex = 0) {
    const { component, style } = element
    // 获取组件的构造函数
    let constructor = Vue.extend(componentToStyled[component])
    // 实例化组件
    let instance = new constructor({
      propsData: style
    })
    // 挂载组件
    instance.$mount()
    // 获取新创建的组件
    let newElement = instance.$el
    // 设置新创建组件的宽度
    newElement.style.width = `${style.width}px`
    // 设置新创建组件的高度，如果auto则设置为auto，否则设置为style.height
    newElement.style.height = AUTO_PAGE_COMPONENT.includes(element.component)
      ? 'auto'
      : `${style.height}px`
    // 设置新创建组件的最小高度，如果存在则设置为style.minHeight，否则设置为空
    newElement.style.minHeight = style.minHeight ? `${style.minHeight}px` : ''
    // 设置新创建组件的位置
    newElement.style.position = 'absolute'
    // 设置新创建组件的left
    newElement.style.left = `${style.left}px`
    // 设置新创建组件的top
    newElement.style.top = `${style.top}px`
    // 设置新创建组件的transform
    newElement.style.transform = `rotate(${style.rotate}deg)`
    // 设置新创建组件的zIndex
    newElement.style.zIndex = zIndex
    // 给新创建的组件添加class
    newElement.classList.add(componentToClassName[component])
    // 销毁实例
    instance.$destroy()
    // 返回新创建的组件
    return newElement
  }

  async renderRoySimpleText({ component, curPageUsedHeight, pageNumber = 1 }) {
    // 生成一个组件的元素和样式
    let { element, style } = this.generateRoySimpleText(component)
    // 如果当前页面已使用的总高度加上当前元素的样式高度大于最大页面高度，则换页，并重置当前页面已使用的总高度
    if (
      curPageUsedHeight &&
      curPageUsedHeight + element.style.height > this.maxPageUseHeight
    ) {
      pageNumber++
      curPageUsedHeight = this.realPageMarginTop
    }
    // 如果当前页面已使用的总高度不存在，则使用当前元素的样式top值
    curPageUsedHeight = curPageUsedHeight || +style.top
    // 设置当前元素的top值
    element.style.top = `${curPageUsedHeight}px`
    // 获取当前页
    let page = this.getPage(pageNumber)
    // 将当前元素添加到当前页
    page.appendChild(element)
    // 更新当前页面已使用的总高度
    curPageUsedHeight += +style.height
    // 返回当前页，当前元素，当前页码，当前页面已使用的总高度
    return {
      page,
      element,
      pageNumber,
      pageUsedHeight: curPageUsedHeight
    }
  }

  async renderRoyLine({ component, curPageUsedHeight, pageNumber = 1 }) {
    // 生成一个组件的元素和样式
    let { element, style } = this.generateRoyLine(component)
    // 如果当前页面已使用的总高度加上当前元素的样式高度大于最大页面高度，则换页，并重置当前页面已使用的总高度
    if (
      curPageUsedHeight &&
      curPageUsedHeight + element.style.height > this.maxPageUseHeight
    ) {
      pageNumber++
      curPageUsedHeight = this.realPageMarginTop
    }
    // 如果当前页面已使用的总高度不存在，则使用当前元素的样式top值
    curPageUsedHeight = curPageUsedHeight || style.top
    // 设置当前元素的top值
    element.style.top = `${curPageUsedHeight}px`
    // 获取当前页
    let page = this.getPage(pageNumber)
    // 将当前元素添加到当前页
    page.appendChild(element)
    // 更新当前页面已使用的总高度
    curPageUsedHeight += +style.height
    // 返回当前页，当前元素，当前页码，当前页面已使用的总高度
    return {
      page,
      element,
      pageUsedHeight: curPageUsedHeight
    }
  }

  async renderRoyCircle({ component, curPageUsedHeight, pageNumber = 1 }) {
    // 生成 RoyCircle 组件
    let { element, style } = this.generateRoyCircle(component)
    // 如果当前页面已使用的高度加上 RoyCircle 组件的高度大于最大页面高度，则换页
    if (
      curPageUsedHeight &&
      curPageUsedHeight + element.style.height > this.maxPageUseHeight
    ) {
      pageNumber++
      curPageUsedHeight = this.realPageMarginTop
    }
    // 设置 RoyCircle 组件的 top 属性
    curPageUsedHeight = curPageUsedHeight || style.top
    element.style.top = `${curPageUsedHeight}px`
    // 获取当前页
    let page = this.getPage(pageNumber)
    // 将 RoyCircle 组件添加到当前页
    page.appendChild(element)
    // 更新当前页面已使用的高度
    curPageUsedHeight += +style.height
    // 返回当前页、RoyCircle 组件和当前页面已使用的高度
    return {
      page,
      element,
      pageUsedHeight: curPageUsedHeight
    }
  }

  async renderRoyRect({ component, curPageUsedHeight, pageNumber = 1 }) {
    // 生成 RoyRect 组件
    let { element, style } = this.generateRoyRect(component)
    // 如果当前页面已使用的高度加上 RoyRect 组件的高度大于最大页面高度，则换页
    if (
      curPageUsedHeight &&
      curPageUsedHeight + element.style.height > this.maxPageUseHeight
    ) {
      pageNumber++
      curPageUsedHeight = this.realPageMarginTop
    }
    // 设置 RoyRect 组件的 top 属性
    curPageUsedHeight = curPageUsedHeight || style.top
    element.style.top = `${curPageUsedHeight}px`
    // 获取当前页
    let page = this.getPage(pageNumber)
    // 将 RoyRect 组件添加到当前页
    page.appendChild(element)
    // 更新当前页面已使用的高度
    curPageUsedHeight += +style.height
    // 返回当前页、RoyRect 组件和当前页面已使用的高度
    return {
      page,
      element,
      pageUsedHeight: curPageUsedHeight
    }
  }

  async renderRoyQRCode({ component, curPageUsedHeight, pageNumber = 1 }) {
    // 生成二维码元素
    let { element, style } = this.generateRoyQRCode(component)
    // 如果当前页面已使用高度加上二维码高度大于最大页面高度，则换页，并将当前页面高度设置为页面的margin-top
    if (
      curPageUsedHeight &&
      curPageUsedHeight + element.style.height > this.maxPageUseHeight
    ) {
      pageNumber++
      curPageUsedHeight = this.realPageMarginTop
    }
    // 如果当前页面高度为空，则设置为style.top
    curPageUsedHeight = curPageUsedHeight || style.top
    // 设置二维码元素的top属性
    element.style.top = `${curPageUsedHeight}px`
    // 获取当前页
    let page = this.getPage(pageNumber)
    // 将二维码元素添加到当前页
    page.appendChild(element)
    // 更新当前页面高度
    curPageUsedHeight += +style.height
    // 返回当前页，二维码元素，当前页面高度
    return {
      page,
      element,
      pageUsedHeight: curPageUsedHeight
    }
  }

  async renderRoyBarCode({ component, curPageUsedHeight, pageNumber = 1 }) {
    // 生成条形码元素
    let { element, style } = this.generateRoyBarCode(component)
    // 如果当前页面已使用高度加上条形码高度大于最大页面高度，则换页，并将当前页面高度设置为页面的margin-top
    if (
      curPageUsedHeight &&
      curPageUsedHeight + element.style.height > this.maxPageUseHeight
    ) {
      pageNumber++
      curPageUsedHeight = this.realPageMarginTop
    }
    // 如果当前页面高度为空，则设置为style.top
    curPageUsedHeight = curPageUsedHeight || style.top
    // 设置条形码元素的top属性
    element.style.top = `${curPageUsedHeight}px`
    // 获取当前页
    let page = this.getPage(pageNumber)
    // 将条形码元素添加到当前页
    page.appendChild(element)
    // 更新当前页面高度
    curPageUsedHeight += +style.height
    // 返回当前页，条形码元素，当前页面高度
    return {
      page,
      element,
      pageUsedHeight: curPageUsedHeight
    }
  }

  async renderRoyStar({ component, curPageUsedHeight, pageNumber = 1 }) {
    // 生成一个元素
    let { element, style } = this.generateRoyStar(component)
    // 如果当前页面已使用的总高度加上元素的当前高度大于最大页面高度，则换页
    if (
      curPageUsedHeight &&
      curPageUsedHeight + element.style.height > this.maxPageUseHeight
    ) {
      pageNumber++
      curPageUsedHeight = this.realPageMarginTop
    }
    // 如果当前页面已使用的总高度为空，则使用元素的top属性
    curPageUsedHeight = curPageUsedHeight || style.top
    // 设置元素的top属性
    element.style.top = `${curPageUsedHeight}px`
    // 获取当前页
    let page = this.getPage(pageNumber)
    // 将元素添加到当前页
    page.appendChild(element)
    // 更新当前页面已使用的总高度
    curPageUsedHeight += +style.height
    // 返回当前页，元素，当前页面已使用的总高度
    return {
      page,
      element,
      pageUsedHeight: curPageUsedHeight
    }
  }

  async renderRoyImage({ component, curPageUsedHeight, pageNumber = 1 }) {
    // 生成一个元素
    let { element, style } = this.generateRoyImage(component)
    // 如果当前页面已使用的总高度加上元素的当前高度大于最大页面高度，则换页
    if (
      curPageUsedHeight &&
      curPageUsedHeight + element.style.height > this.maxPageUseHeight
    ) {
      pageNumber++
      curPageUsedHeight = this.realPageMarginTop
    }
    // 如果当前页面已使用的总高度为空，则使用元素的top属性
    curPageUsedHeight = curPageUsedHeight || style.top
    // 设置元素的top属性
    element.style.top = `${curPageUsedHeight}px`
    // 获取当前页
    let page = this.getPage(pageNumber)
    // 将元素添加到当前页
    page.appendChild(element)
    // 更新当前页面已使用的总高度
    curPageUsedHeight += +style.height
    // 返回当前页，元素，当前页面已使用的总高度
    return {
      page,
      element,
      pageUsedHeight: curPageUsedHeight
    }
  }

  async renderRoyText() {}

  async renderRoySimpleTable() {}

  renderRoyComplexTable() {}

  getTablesSplit({
    // 传入的行数据
    rows,
    // 头部元素
    header = null,
    // 尾部元素
    footer = null,
    // 是否是DataTable
    isDataTable,
    // 样式
    style,
    // 当前页面使用的高度
    curPageUsedHeight
  }) {
    // { tables, overflowPages, maxTableWidth }
    let headerHeight = 0
    let footerHeight = 0
    // 获取头部高度
    if (isDataTable && header !== null) {
      let innerCell = header.getElementsByClassName('roy-complex-table-cell-in')
      for (let cell of innerCell) {
        headerHeight =
          headerHeight < cell.children[0].clientHeight
            ? cell.children[0].clientHeight
            : headerHeight
      }
      header.children[0].style.height = `${headerHeight}px`
    }
    // 获取尾部高度 TODO: 新增尾部固定行
    if (isDataTable && footer !== null) {
      let innerCell = footer.getElementsByClassName('roy-complex-table-cell-in')
      for (let cell of innerCell) {
        footerHeight =
          footerHeight < cell.children[0].clientHeight
            ? cell.children[0].clientHeight
            : footerHeight
      }
      footer.children[0].style.height = `${footerHeight}px`
    }
    let headerHtml = header === null ? '' : header.outerHTML
    let footerHtml = footer === null ? '' : footer.outerHTML

    // 获取真实高度
    let realTop = curPageUsedHeight === 0 ? style.top : curPageUsedHeight

    // 当前高度
    let curHeight = realTop + headerHeight + footerHeight

    let curHtml = ''
    let tables = []
    let overflowPages = []
    let maxTableWidth = 0

    // 遍历行数据
    for (let i = 0; i < rows.length; i++) {
      let curRow = rows[i]
      let cellMaxHeight = 0
      // 如果是DataTable，则获取最大高度
      if (isDataTable) {
        let innerCell = curRow.getElementsByClassName(
          'roy-complex-table-cell-in'
        )
        for (let cell of innerCell) {
          cellMaxHeight =
            cellMaxHeight < cell.children[0].clientHeight
              ? cell.children[0].clientHeight
              : cellMaxHeight
        }
        curRow.style.height = `${cellMaxHeight}px`
      }

      // 记录上一个高度
      let lastHeight = curHeight
      // 当前高度
      curHeight += Math.max(curRow.clientHeight, cellMaxHeight)
      // 记录最大表格宽度
      maxTableWidth =
        maxTableWidth > curRow.clientWidth ? maxTableWidth : curRow.clientWidth

      // 如果当前高度大于最大页面高度，则将当前行数据放入表格中
      if (curHeight > this.maxPageUseHeight) {
        tables.push({
          html: `${headerHtml}<tbody>${curHtml}</tbody>`,
          height: lastHeight
        })
        // 如果上一个高度大于最大页面高度，则将当前表格放入溢出页面中
        if (lastHeight > this.maxPageUseHeight) {
          overflowPages.push(tables.length - 1)
        }
        // 更新当前高度
        curHeight =
          this.realPageMarginTop +
          Math.max(curRow.clientHeight, cellMaxHeight) +
          headerHeight +
          footerHeight
        // 记录当前行数据
        curHtml = curRow.outerHTML
      } else {
        // 否则记录当前行数据
        curHtml += curRow.outerHTML
      }
      // 如果是最后一个元素，则将当前行数据放入表格中
      if (i === rows.length - 1) {
        // 最后一个元素
        tables.push({
          html: `${headerHtml}<tbody>${curHtml}</tbody>${footerHtml}`,
          height: curHeight
        })
      }
    }
    // 返回表格数据
    return { tables, overflowPages, maxTableWidth }
  }
}

class FixedPageGenerator extends BasePageGenerator {
  constructor(data) {
    super(data)
    // 当前单组件使用的页面高度
    this.curPageUsedHeight = 0
  }

  // async函数，用于渲染富文本文本
  async renderRoyText({
    // 传入的组件
    component,
    // 限制宽度
    restrictWidth,
    // 当前页面的使用高度
    curPageUsedHeight,
    // 页码，默认为1
    pageNumber = 1,
    // 父元素
    parentElement
  }) {
    // 获取组件的样式
    const {
      style: { top, rotate, height: elementHeight }
    } = component
    // 获取当前页面的使用高度，如果没有传入，则使用top
    let pageUsedHeight = curPageUsedHeight ?? top
    // 生成富文本文本
    let { element } = this.generateRoyText(
      component,
      parentElement?.index || component.index,
      parentElement
    )
    // 获取当前页
    let page = this.getPage(pageNumber)
    // 将富文本文本添加到当前页
    page.appendChild(element)
    // 挂载当前页
    await page.mount()
    // 获取富文本文本的高度
    let { height } = element.getBoundingClientRect()
    // 获取富文本文本的边框
    const border = element.style.border
    // 如果限制宽度，则设置富文本文本的宽度
    if (restrictWidth !== undefined) {
      element.style.width = `${restrictWidth}px`
    }
    // 设置富文本文本的top
    element.style.top = `${pageUsedHeight}px`
    // 如果富文本文本的高度加上当前页面的使用高度大于最大高度，则需要换页
    if (height + pageUsedHeight > this.maxPageUseHeight) {
      // 单页富文本高度大于当页，需要分页
      // 设置富文本文本的边框为none
      element.style.border = 'none'
      // 自动拆分富文本文本
      const autoSplitText = new AutoSplitText(element)
      // 获取拆分后的富文本图片列表
      const richTextImgList = await autoSplitText.run()
      // 设置富文本文本的display为inline-grid
      element.style.display = 'inline-grid'
      // 清空富文本文本的内容
      element.innerHTML = ''
      // 从当前页中移除富文本文本
      page.removeChild(element)
      // 克隆一个空节点
      let clonedEmptyNode = element.cloneNode()
      // 遍历拆分后的富文本图片列表
      for (let i = 0; i < richTextImgList.length; i++) {
        const imgData = richTextImgList[i]
        // 创建一个img元素
        const imgEle = document.createElement('img')
        // 设置img元素的src
        imgEle.src = imgData.src
        // 设置img元素的宽度
        imgEle.style.width = `${imgData.width}px`
        // 设置img元素的高度
        imgEle.style.height = `${imgData.height}px`
        // 将img元素添加到空节点中
        clonedEmptyNode.appendChild(imgEle)
        // 更新当前页面的使用高度
        pageUsedHeight += imgData.height
        // 如果当前页面的使用高度大于最大高度，且img元素的宽度小于最大高度，则需要换新的一页了
        if (
          pageUsedHeight > this.maxPageUseHeight &&
          imgData.height <= this.maxPageUseHeight
        ) {
          // 页面超出，需要换新的一页了
          // 设置空节点旋转角度
          clonedEmptyNode.style.transform = `rotate(${rotate}deg)`
          // 设置空节点边框
          clonedEmptyNode.style.border = border
          // 移除img元素
          clonedEmptyNode.removeChild(imgEle)
          // 将空节点添加到当前页
          await page.appendHTML(clonedEmptyNode.outerHTML)
          // 页码加1
          pageNumber++
          // 更新当前页面的使用高度
          pageUsedHeight = this.realPageMarginTop
          // 获取当前页
          page = this.getPage(pageNumber)
          // 克隆一个空节点
          clonedEmptyNode = element.cloneNode()
          // 设置空节点top
          clonedEmptyNode.style.top = `${this.realPageMarginTop}px`
          // 将img元素添加到空节点中
          clonedEmptyNode.appendChild(imgEle)
        } else if (
          imgData.height > this.maxPageUseHeight ||
          i === richTextImgList.length - 1
        ) {
          // 循环就要结束了，或者一个图片太高了
          // 设置空节点旋转角度
          clonedEmptyNode.style.transform = `rotate(${rotate}deg)`
          // 设置空节点边框
          clonedEmptyNode.style.border = border
          // 将空节点添加到当前页
          await page.appendHTML(clonedEmptyNode.outerHTML)
        }
      }
      // 清空富文本文本
      element = null
    } else {
      // 设置富文本文本旋转角度
      element.style.transform = `rotate(${rotate}deg)`
      // 设置富文本文本的最小高度
      element.style.minHeight = `${elementHeight}px`
      // 设置富文本文本的边框
      element.style.border = border
      // 更新当前页面的使用高度
      pageUsedHeight += height
    }
    // 卸载当前页
    page.unmount()
    // 返回当前页面的使用高度和页码
    return {
      pageUsedHeight,
      pageNumber
    }
  }

  // async函数，用于渲染简单表格，参数包括：组件、限制宽度、当前页面已使用的高度、页码、marginTop、父元素
  async renderRoySimpleTable({
    component,
    restrictWidth,
    curPageUsedHeight,
    pageNumber = 1,
    marginTop,
    parentElement
  }) {
    // 生成组件
    let { element, style, innerElement } = this.generateRoySimpleTable(
      component,
      parentElement?.index || component.index,
      parentElement
    )
    // 获取当前页面已使用的高度
    let pageUsedHeight = curPageUsedHeight ?? style.top
    // 获取当前页码
    let page = this.getPage(pageNumber)
    // 将组件添加到当前页面上
    page.appendChild(element)
    // 如果限制宽度不为undefined，则设置组件的宽度
    if (restrictWidth !== undefined) {
      element.style.width = `${restrictWidth}px`
    }
    // 如果marginTop不为undefined，则设置组件的marginTop
    if (marginTop !== undefined) {
      element.style.marginTop = `${marginTop}`
    }
    // 等待页面加载
    await page.mount()
    // 获取组件的高度
    let { height } = element.getBoundingClientRect()
    // 设置组件的top值
    element.style.top = `${pageUsedHeight}px`
    // 如果组件的高度加上当前页面已使用的高度大于最大页面高度，则需要分页
    if (height + pageUsedHeight > this.maxPageUseHeight) {
      // 需要分页
      // 获取表格元素
      const tdElements = element.getElementsByClassName('roy-simple-table-row')
      // 获取表格的分割结果
      const { tables, overflowPages, maxTableWidth } = this.getTablesSplit({
        style: style,
        rows: tdElements,
        curPageUsedHeight: pageUsedHeight
      })
      // 清空innerElement的内容
      innerElement.innerHTML = ''
      // 从父元素中移除element
      page.removeChild(element)
      // 遍历表格，添加到页面中
      tables.forEach((table, index) => {
        // 克隆element和parentElement
        let cleanChildNode = parentElement
          ? innerElement.cloneNode()
          : element.cloneNode()
        let cleanParentNode = element.cloneNode()
        // 如果不是第一个表格，则添加marginTop
        if (index > 0) {
          if (parentElement) {
            cleanParentNode.style.top = `${this.realPageMarginTop}px`
          } else {
            cleanChildNode.style.top = `${this.realPageMarginTop}px`
          }
          pageUsedHeight = this.realPageMarginTop
          pageNumber++
          page = this.getPage(pageNumber)
        }
        // 添加表格内容
        cleanChildNode.innerHTML = `<table style="width: ${
          restrictWidth || maxTableWidth
        }px;table-layout: auto">${table.html}</table>`
        // 如果表格是溢出表格，则添加overflow属性
        if (overflowPages.includes(index)) {
          cleanParentNode.style.height = `${
            this.pageHeight - this.realPageMarginBottom - this.realPageMarginTop
          }px`
          cleanParentNode.style.overflow = 'hidden'
        }
        // 如果parentElement存在，则添加cleanChildNode的内容到cleanParentNode中，否则添加cleanChildNode的内容到element中
        if (parentElement) {
          cleanParentNode.innerHTML = cleanChildNode.outerHTML
          page.appendHTML(cleanParentNode.outerHTML)
        } else {
          page.appendHTML(cleanChildNode.outerHTML)
        }
        // 更新当前页面已使用的高度
        pageUsedHeight = table.height + this.realPageMarginTop
      })
    } else {
      // 更新当前页面已使用的高度
      pageUsedHeight += height
    }
    // 卸载页面
    page.unmount()
    // 返回当前页面已使用的高度和页码
    return {
      pageUsedHeight,
      pageNumber
    }
  }

  // async函数，用于渲染复杂表格
  async renderRoyComplexTable({
    // 传入组件
    component,
    // 默认页码为1
    pageNumber = 1,
    // 默认当前页面高度
    curPageUsedHeight
  }) {
    // 解构组件的属性
    const { showPrefix, showHead, showFoot, showSuffix, style } = component
    // 解构组件的属性值
    const {
      prefixTextElement,
      suffixTextElement,
      headSimpleTableElement,
      footSimpleTableElement,
      bodyDataTableElement
    } = component.propValue
    // 解构bodyDataTableElement的属性
    const { bodyTableWidth } = bodyDataTableElement
    // 默认页面高度
    let pageUsedHeight = curPageUsedHeight || style.top || 0
    // 如果showPrefix为true，则渲染文本
    if (showPrefix) {
      const res = await this.renderRoyText({
        component: prefixTextElement,
        restrictWidth: bodyTableWidth,
        curPageUsedHeight: pageUsedHeight,
        pageNumber: pageNumber,
        parentElement: component
      })
      // 更新页码和页面高度
      pageNumber = res.pageNumber
      pageUsedHeight = res.pageUsedHeight
    }
    // 如果showHead为true，则渲染简单表格
    if (showHead) {
      const res = await this.renderRoySimpleTable({
        component: headSimpleTableElement,
        restrictWidth: bodyTableWidth,
        curPageUsedHeight: pageUsedHeight,
        pageNumber: pageNumber,
        parentElement: component
      })
      // 更新页码和页面高度
      pageNumber = res.pageNumber
      pageUsedHeight = res.pageUsedHeight
    }

    // 生成中间元素
    let {
      newElement: middleElement,
      tableStart,
      tableEnd
    } = this.generateRoyDataTable(component, component.index)

    // 添加中间元素到页面
    let page = this.getPage(pageNumber)
    page.appendChild(middleElement)

    // 设置中间元素的位置
    middleElement.style.top = `${pageUsedHeight}px`

    // 如果showHead为true，则设置中间元素的margin-top
    if (showHead) {
      middleElement.style.marginTop = `-${component.style.borderWidth - 0.5}px`
    }

    // 挂载页面
    await page.mount()

    // 获取中间元素的高度
    let { height } = middleElement.getBoundingClientRect()

    // 如果中间元素的高度加上页面高度大于最大页面高度，则需要分页
    if (height + pageUsedHeight > this.maxPageUseHeight) {
      // 设置中间元素的位置
      middleElement.style.top = `${pageUsedHeight}px`
      // 需要分页
      const trElements = middleElement.getElementsByClassName(
        'roy-complex-table-row'
      )
      const thElement = middleElement.getElementsByClassName(
        'roy-complex-table-thead'
      )[0]
      const { tables, overflowPages } = this.getTablesSplit({
        rows: trElements,
        header: thElement,
        isDataTable: true,
        style: component.style
      })
      // 删除中间元素
      middleElement.innerHTML = ''
      page.removeChild(middleElement)
      // 渲染分页
      tables.forEach((table, index) => {
        let cleanCopyNode = middleElement.cloneNode()
        // 如果不是第一个表格，则添加margin-top，并更新页面高度
        if (index > 0) {
          cleanCopyNode.style.top = `${this.realPageMarginTop}px`
          pageUsedHeight = this.realPageMarginTop
          pageNumber++
          page = this.getPage(pageNumber)
        }
        // 添加表格到中间元素
        middleElement.innerHTML = `${tableStart}${table.html}${tableEnd}`
        // 如果表格是溢出表格，则添加overflow和设置高度
        if (overflowPages.includes(index)) {
          cleanCopyNode.style.height = `${
            this.pageHeight - this.realPageMarginBottom - this.realPageMarginTop
          }px`
          cleanCopyNode.style.overflow = 'hidden'
        }
        // 添加到页面
        page.appendHTML(cleanCopyNode.outerHTML)
        // 更新页面高度
        pageUsedHeight = table.height + this.realPageMarginTop
      })
    } else {
      // 如果中间元素的高度小于最大页面高度，则更新页面高度
      pageUsedHeight += height
    }
    page.unmount()

    // 如果需要渲染页脚
    if (showFoot) {
      // 渲染页脚表格
      const res = await this.renderRoySimpleTable({
        component: footSimpleTableElement,
        restrictWidth: bodyTableWidth,
        curPageUsedHeight: pageUsedHeight,
        pageNumber: pageNumber,
        parentElement: component,
        marginTop: `-${+component.style.borderWidth + 1}px`
      })
      // 更新页脚表格的页码
      pageNumber = res.pageNumber
      // 更新页脚表格的高度
      pageUsedHeight = res.pageUsedHeight
    }
    // 如果需要渲染页脚后缀
    if (showSuffix) {
      // 渲染页脚后缀文本
      const res = await this.renderRoyText({
        component: suffixTextElement,
        restrictWidth: bodyTableWidth,
        curPageUsedHeight: pageUsedHeight,
        pageNumber: pageNumber,
        parentElement: component
      })
      // 更新页脚后缀文本的页码
      pageNumber = res.pageNumber
      // 更新页脚后缀文本的高度
      pageUsedHeight = res.pageUsedHeight
    }
    // 返回渲染后的页码和页脚高度
    return {
      pageUsedHeight,
      pageNumber
    }
  }
}

class RelativePageGenerator extends FixedPageGenerator {
  constructor(data) {
    super(data)
    // 记录当前已经渲染过的元素信息
    this.renderedElementMap = {}
    this.totalPageUsedHeight = 0
    this.maxPageNum = 1
  }

  // async函数，用于渲染唯一的元素
  async renderUniqueElement(uniqueElements) {
    // 遍历uniqueElements数组
    for (let i = 0; i < uniqueElements.length; i++) {
      // 获取当前元素
      const curElement = uniqueElements[i]
      // 获取当前元素的组件
      const { component } = curElement
      // 获取下一个渲染信息
      const { nextPageUsedHeight, nextPageNumber } =
        await this.getNextRenderInfo(curElement)
      // 渲染当前元素
      const { page, pageUsedHeight, pageNumber } = await this[
        `render${component}`
      ]({
        component: curElement,
        curPageUsedHeight: nextPageUsedHeight,
        pageNumber: nextPageNumber
      })
      // 更新最大页面数
      this.maxPageNum = Math.max(pageNumber, this.maxPageNum)
      // 存储渲染信息
      await this.storeRenderedInfo({
        page,
        element: curElement,
        pageUsedHeight,
        pageNumber
      })
    }
  }

  getNextRenderInfo(curElement) {
    // 获取已经渲染过的组件
    let renderedComponents = Object.values(this.renderedElementMap)
    // 如果没有渲染过的组件，则返回
    if (renderedComponents.length === 0) {
      return {
        nextPageUsedHeight: undefined,
        nextPageNumber: 1
      }
    }
    // 获取当前组件的位置信息
    const { position } = curElement
    // 初始化最大页面数和最小相对高度
    let maxPageNum = 1
    let minRelativeHeight = {}
    let relativePageHeight = {}
    // 遍历已经渲染过的每个组件，查看是否与当前组件有相交的关系
    renderedComponents.forEach((rComp) => {
      const {
        name: rCompName,
        position: rCompPos,
        realPageHeight,
        pageNumber = 1
      } = rComp
      // 遍历已经渲染过的每个组件，查看是否与当前组件有相交的关系
      // 判断是否是自动页面组件
      let rCompIsAutoPage = AUTO_PAGE_COMPONENT.includes(rCompName)
      let curCompIsAutoPage = AUTO_PAGE_COMPONENT.includes(curElement.component)

      if (curCompIsAutoPage || rCompIsAutoPage) {
        // 获取相对高度和是否超出
        let { isIntersect, isBlow, relativeHeight } =
          this.getRelativePositionInfo(rCompPos, position)
        // 如果相交且超出，则更新最大页面数和最小相对高度
        if (isIntersect && isBlow) {
          maxPageNum = Math.max(pageNumber, maxPageNum)
          minRelativeHeight[pageNumber] = Math.min(
            minRelativeHeight[pageNumber] || Infinity,
            relativeHeight
          )
          relativePageHeight[pageNumber] =
            minRelativeHeight[pageNumber] + realPageHeight
        }
      }
    })
    // 返回最大页面数和最大页面高度
    return {
      nextPageUsedHeight: relativePageHeight[maxPageNum] || undefined,
      nextPageNumber: maxPageNum
    }
  }

  getRelativePositionInfo(positionA, positionB) {
    let isIntersect = false
    let isBlow = false
    let relativeHeight = 0
    const { lx: aLx, rx: aRx, ty: aTy, by: aBy } = positionA
    const { lx: bLx, rx: bRx, ty: bTy } = positionB
    const aMidX = (aRx - aLx) / 2 + aLx
    const bMidX = (bRx - bLx) / 2 + bLx
    const abMidX = (aRx - aLx) / 2 + (bRx - bLx) / 2
    // 判断位置A和位置B是否相交
    isIntersect = Math.abs(aMidX - bMidX) <= Math.abs(abMidX)
    // 计算位置A和位置B的高度差
    relativeHeight = bTy - aBy
    // 判断位置B的高度是否大于位置A的高度
    isBlow = bTy >= aTy
    return {
      isIntersect,
      isBlow,
      relativeHeight
    }
  }

  async storeRenderedInfo({ page, element, pageUsedHeight, pageNumber }) {
    if (!element) return
    const { id } = element
    if (pageUsedHeight !== undefined) {
      // 如果pageUsedHeight存在，则直接将element的信息存入renderedElementMap中
      this.renderedElementMap[id] = {
        name: element.component,
        position: element.position,
        realPageHeight: pageUsedHeight,
        pageNumber: pageNumber,
        height: element.style.height
      }
    } else {
      // FIXME: 应该不会走这个分支
      // 如果pageUsedHeight不存在，则先mount page，获取element的高度，然后将element的信息存入renderedElementMap中
      await page.mount()
      const { height } = element.getBoundingClientRect()
      this.renderedElementMap[id] = {
        name: element.component,
        position: element.position,
        realPageHeight: height + element.style.top,
        pageNumber: pageNumber,
        height: element.style.height
      }
      page.unmount()
    }
  }
}

const layoutToGenerator = {
  fixed: FixedPageGenerator,
  relative: RelativePageGenerator
}

// 导出一个函数，用于获取页面生成器
export function getPageGenerator({
  // 渲染元素
  renderElements,
  // 分页配置
  pagerConfig,
  // 数据集
  dataSet,
  // 数据源
  dataSource
}) {
  // 获取页面布局，默认为fixed
  const { pageLayout = 'fixed' } = pagerConfig
  // 根据页面布局从layoutToGenerator中获取对应的生成器
  const Generator = layoutToGenerator[pageLayout]
  // 返回一个新的生成器，并传入渲染元素、分页配置、数据集和数据源
  return new Generator({ renderElements, pagerConfig, dataSet, dataSource })
}
