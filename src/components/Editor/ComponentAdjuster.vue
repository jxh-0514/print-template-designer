<!--
* @description 组件小圆角
* @filename ComponentAdjuster.vue
* @author ROYIANS
* @date 2022/10/18 11:13
!-->
<template>
  <div
    ref="adjuster"
    :style="adjusterStyle"
    class="roy-component-adjuster"
    @click="selectCurComponent"
    @mousedown="handleMouseDownOnShape"
  >
    <span
      v-show="isActive && showRotate"
      class="ri-checkbox-blank-circle-line roy-component-adjuster__rotate"
      @mousedown="handleRotate"
    ></span>
    <span
      v-show="element.isLock"
      class="ri-lock-fill roy-component-adjuster__lock"
    ></span>
    <span
      v-show="element.bindValue"
      class="ri-link-unlink-m roy-component-adjuster__bind"
      @click="unlinkElement"
    ></span>
    <span
      :class="element.icon"
      class="roy-component-adjuster__move"
      @mousedown="handleMouseMoveItem"
    ></span>
    <div
      v-for="item in isActive ? pointList : []"
      :key="item"
      :class="`roy-component-adjuster__shape-point--${item}`"
      :style="getPointStyle(item)"
      @mousedown="handleMouseDownOnPoint(item, $event)"
    ></div>
    <div ref="slot" class="adjuster-container">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import commonMixin from '@/mixin/commonMixin'
import { mod360 } from '@/utils/translate'
import calculateComponentPositionAndSize from '@/utils/calculateComponentPositonAndSize'
import { isPreventDrop } from '@/utils/html-util'
import ResizeObserver from '@/utils/ResizeObserver'
import eventBus from '@/utils/eventBus'
import { mapState } from 'vuex'

/**
 * 组件小圆角
 */
export default {
  name: 'ComponentAdjuster',
  mixins: [commonMixin],
  components: {},
  props: {
    active: {
      type: Boolean,
      default: false
    },
    element: {
      required: true,
      type: Object,
      default: () => {}
    },
    defaultStyle: {
      required: true,
      type: Object,
      default: () => {}
    },
    index: {
      required: true,
      type: [Number, String],
      default: 0
    },
    scale: {
      required: true,
      type: [Number, String],
      default: 1
    }
  },
  data() {
    return {
      cursors: {},
      initialAngle: {
        // 每个点对应的初始角度
        lt: 0,
        t: 45,
        rt: 90,
        r: 135,
        rb: 180,
        b: 225,
        lb: 270,
        l: 315
      },
      angleToCursor: [
        // 每个范围的角度对应的光标
        { start: 338, end: 23, cursor: 'nw' },
        { start: 23, end: 68, cursor: 'n' },
        { start: 68, end: 113, cursor: 'ne' },
        { start: 113, end: 158, cursor: 'e' },
        { start: 158, end: 203, cursor: 'se' },
        { start: 203, end: 248, cursor: 's' },
        { start: 248, end: 293, cursor: 'sw' },
        { start: 293, end: 338, cursor: 'w' }
      ]
    }
  },
  computed: {
    ...mapState({
      editor: (state) => state.printTemplateModule.editor,
      curComponent: (state) => state.printTemplateModule.curComponent
    }),
    pointList() {
      const isTable = ['RoySimpleTable', 'RoyComplexTable'].includes(
        this.element.component
      )
      if (isTable) {
        return ['b']
      }
      if (['RoyLine'].includes(this.element.component)) {
        return ['r', 'l']
      }
      return ['lt', 't', 'rt', 'r', 'rb', 'b', 'lb', 'l']
    },
    isActive() {
      return this.active && !this.element.isLock
    },
    showRotate() {
      return !['RoySimpleTable', 'RoyComplexTable'].includes(
        this.element?.component || ''
      )
    },
    adjusterStyle() {
      return {
        border: this.isActive
          ? '0.5px solid var(--roy-text-color-secondary)'
          : '0.5px dashed var(--roy-text-color-secondary)'
      }
    }
  },
  methods: {
    initMounted() {
      this.cursors = this.getCursor()
      this.observeElementShape()
    },
    observeElementShape() {
      this.$nextTick(() => {
        // 这边还是观察外层（虚线框的大小而不是里面组件的大小吧）
        const element = this.$refs.slot
        if (!element) {
          return
        }
        const resizeObserver = new ResizeObserver()
        const callback = () => {
          this.$nextTick(() => {
            this.$store.commit('printTemplateModule/setShapePosition', {
              width: element.clientWidth,
              height: element.clientHeight
            })
          })
        }
        resizeObserver.onElResize(element, callback)
      })
    },
    getPointStyle(point) {
      let { width, height } = this.defaultStyle
      const adjuster = this.$refs.adjuster
      if (adjuster && (!width || isNaN(width) || !height || isNaN(height))) {
        width = adjuster.clientWidth
        height = adjuster.clientHeight
      }
      const hasT = /t/.test(point)
      const hasB = /b/.test(point)
      const hasL = /l/.test(point)
      const hasR = /r/.test(point)
      let newLeft = 0
      let newTop = 0

      // 四个角的点
      if (point.length === 2) {
        newLeft = hasL ? 0 : width
        newTop = hasT ? 0 : height
      } else {
        // 上下两点的点，宽度居中
        if (hasT || hasB) {
          newLeft = width / 2
          newTop = hasT ? 0 : height
        }

        // 左右两边的点，高度居中
        if (hasL || hasR) {
          newLeft = hasL ? 0 : width
          newTop = Math.floor(height / 2)
        }
      }

      return {
        marginLeft: '-4px',
        marginTop: '-4px',
        left: `${newLeft}px`,
        top: `${newTop}px`,
        cursor: this.cursors[point]
      }
    },
    getCursor() {
      const rotate = mod360(this.curComponent?.style?.rotate || 0) // 取余 360
      const result = {}
      let lastMatchIndex = -1 // 从上一个命中的角度的索引开始匹配下一个，降低时间复杂度

      this.pointList.forEach((point) => {
        const angle = mod360(this.initialAngle[point] + rotate)
        const len = this.angleToCursor.length
        // eslint-disable-next-line no-constant-condition
        while (true) {
          lastMatchIndex = (lastMatchIndex + 1) % len
          const angleLimit = this.angleToCursor[lastMatchIndex]
          if (angle < 23 || angle >= 338) {
            result[point] = 'nw-resize'

            return
          }

          if (angleLimit.start <= angle && angle < angleLimit.end) {
            result[point] = angleLimit.cursor + '-resize'

            return
          }
        }
      })

      return result
    },
    handleRotate(e) {
      this.$store.commit('printTemplateModule/setClickComponentStatus', true)
      e.preventDefault()
      e.stopPropagation()
      // 初始坐标和初始角度
      const pos = { ...this.defaultStyle }
      const startY = e.clientY
      const startX = e.clientX
      const startRotate = pos.rotate

      // 获取元素中心点位置
      const rect = this.$el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // 旋转前的角度
      const rotateDegreeBefore =
        Math.atan2(startY - centerY, startX - centerX) / (Math.PI / 180)

      // 如果元素没有移动，则不保存快照
      let hasMove = false
      const move = (moveEvent) => {
        hasMove = true
        const curX = moveEvent.clientX
        const curY = moveEvent.clientY
        // 旋转后的角度
        const rotateDegreeAfter =
          Math.atan2(curY - centerY, curX - centerX) / (Math.PI / 180)
        // 获取旋转的角度值
        pos.rotate = startRotate + rotateDegreeAfter - rotateDegreeBefore
        // 修改当前组件样式
        this.$store.commit('printTemplateModule/setShapeStyle', pos)
      }

      const up = () => {
        hasMove && this.$store.commit('printTemplateModule/recordSnapshot')
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
        this.cursors = this.getCursor() // 根据旋转角度获取光标位置
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },
    unlinkElement() {
      this.$store.commit('printTemplateModule/setBindValue', {
        id: this.element.id,
        bindValue: null
      })
      this.$store.commit('printTemplateModule/setPropValue', {
        id: this.element.id,
        propValue: ''
      })
    },
    handleMouseDownOnPoint(point, e) {
      this.$store.commit('printTemplateModule/setInEditorStatus', true)
      this.$store.commit('printTemplateModule/setClickComponentStatus', true)
      e.stopPropagation()
      e.preventDefault()

      const style = { ...this.defaultStyle }
      const element = this.$el.querySelector(
        `#roy-component-${this.element.id}`
      )

      let newStyle = {
        ...style,
        width: isNaN(style.width) ? element.clientWidth : style.width,
        height: isNaN(style.height) ? element.clientHeight : style.height
      }

      // 组件宽高比
      const proportion = newStyle.width / newStyle.height

      // 组件中心点
      const center = {
        x: newStyle.left + newStyle.width / 2,
        y: newStyle.top + newStyle.height / 2
      }

      // 获取画布位移信息
      const editorRectInfo = this.editor.getBoundingClientRect()

      // 获取 point 与实际拖动基准点的差值
      const pointRect = e.target.getBoundingClientRect()
      // 当前点击圆点相对于画布的中心坐标
      const curPoint = {
        x: Math.round(
          pointRect.left / this.scale -
            editorRectInfo.left / this.scale +
            e.target.offsetWidth / this.scale / 2
        ),
        y: Math.round(
          pointRect.top / this.scale -
            editorRectInfo.top / this.scale +
            e.target.offsetHeight / this.scale / 2
        )
      }

      // 获取对称点的坐标
      const symmetricPoint = {
        x: center.x - (curPoint.x - center.x),
        y: center.y - (curPoint.y - center.y)
      }

      // 是否需要保存快照
      let needSave = false
      let isFirst = true

      const needLockProportion = this.isNeedLockProportion()
      const move = (moveEvent) => {
        // 第一次点击时也会触发 move，所以会有“刚点击组件但未移动，组件的大小却改变了”的情况发生
        // 因此第一次点击时不触发 move 事件
        if (isFirst) {
          isFirst = false
          return
        }

        needSave = true
        const curPosition = {
          x: (moveEvent.clientX - Math.round(editorRectInfo.left)) / this.scale,
          y: (moveEvent.clientY - Math.round(editorRectInfo.top)) / this.scale
        }

        const isTable = ['RoySimpleTable', 'RoyComplexTable'].includes(
          this.element.component
        )
        const isSyncWH = this.element.isSyncWH

        calculateComponentPositionAndSize(
          point,
          newStyle,
          curPosition,
          proportion,
          needLockProportion,
          {
            center,
            curPoint,
            symmetricPoint
          },
          isTable ? element.clientHeight : 0
        )

        this.$store.commit('printTemplateModule/setShapeStyle', {
          ...newStyle,
          height: isSyncWH
            ? Math.max(newStyle.width, newStyle.height)
            : newStyle.height,
          width: isTable
            ? 'auto'
            : isSyncWH
            ? Math.max(newStyle.width, newStyle.height)
            : newStyle.width
        })
      }

      const up = () => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
        needSave && this.$store.commit('printTemplateModule/recordSnapshot')
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },
    isNeedLockProportion() {
      if (this.element.component !== 'RoyGroup') {
        return false
      }
      const rotates = [0, 90, 180, 360]
      for (const component of this.element.propValue) {
        if (!rotates.includes(mod360(parseInt(component.style.rotate)))) {
          return true
        }
      }

      return false
    },
    selectCurComponent(e) {
      // 阻止向父组件冒泡
      e.stopPropagation()
      e.preventDefault()
    },
    handleMouseDownOnShape(e) {
      // 触发组件点击事件
      this.$nextTick(() => eventBus.$emit('componentClick'))

      // 设置编辑器状态为true
      this.$store.commit('printTemplateModule/setInEditorStatus', true)
      // 设置点击组件状态为true
      this.$store.commit('printTemplateModule/setClickComponentStatus', true)
      // 如果当前组件禁止拖拽，则阻止默认行为
      if (isPreventDrop(this.element.component)) {
        e.preventDefault()
      }

      // 阻止事件冒泡
      e.stopPropagation()
      // 设置当前组件
      this.$store.commit('printTemplateModule/setCurComponent', {
        component: this.element,
        index: this.index
      })
      // 设置调色板计数
      this.$store.commit('printTemplateModule/setPaletteCount')

      // 如果当前组件锁定，则返回
      if (this.element.isLock) {
        return
      }

      // 获取光标位置
      this.cursors = this.getCursor() // 根据旋转角度获取光标位置
    },
    handleMouseMoveItem(e) {
      if (!this.isActive) {
        return
      }
      let adjuster = this.$el.querySelector(`#roy-component-${this.element.id}`)
      const pos = { ...this.defaultStyle }
      const startY = e.clientY
      const startX = e.clientX
      // 如果直接修改属性，值的类型会变为字符串，所以要转为数值型
      const startTop = Number(pos.top)
      const startLeft = Number(pos.left)

      // 如果元素没有移动，则不保存快照
      let hasMove = false
      const move = (moveEvent) => {
        hasMove = true
        const curX = moveEvent.clientX
        const curY = moveEvent.clientY
        const editorRectInfo = this.editor
        console.log('组件移动---', this.editor);
        pos.top = Math.min(
          Math.max(0, (curY - startY) / this.scale + startTop),
          editorRectInfo.offsetHeight - adjuster.offsetHeight
        )
        pos.left = Math.min(
          Math.max(0, (curX - startX) / this.scale + startLeft),
          editorRectInfo.offsetWidth - adjuster.offsetWidth
        )

        // 修改当前组件样式
        this.$store.commit('printTemplateModule/setShapeStyle', pos)
        // 等更新完当前组件的样式并绘制到屏幕后再判断是否需要吸附
        // 如果不使用 $nextTick，吸附后将无法移动
        this.$nextTick(() => {
          // 触发元素移动事件，用于显示标线、吸附功能
          // 后面两个参数代表鼠标移动方向
          // curY - startY > 0 true 表示向下移动 false 表示向上移动
          // curX - startX > 0 true 表示向右移动 false 表示向左移动
          eventBus.$emit(
            'move',
            curY - startY > 0,
            curX - startX > 0,
            curX,
            curY
          )
        })
      }

      const up = () => {
        hasMove && this.$store.commit('printTemplateModule/recordSnapshot')
        // 触发元素停止移动事件，用于隐藏标线
        eventBus.$emit('unmove')
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    }
  },
  created() {},
  mounted() {
    this.initMounted()
  },
  watch: {}
}
</script>

<style lang="scss">
.roy-component-adjuster {
  margin: 0;
  padding: 0;
  position: absolute;
  user-select: none;

  &:hover {
    border: 0.5px dotted var(--roy-text-color-secondary);
  }

  .roy-component-adjuster__rotate {
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%);
    cursor: grab;
    color: var(--roy-text-color-regular);
    font-size: 10px;
    font-weight: 400;

    &:active {
      cursor: grabbing;
    }

    &:after {
      content: '';
      height: 20px;
      border-right: var(--roy-text-color-regular) dashed 1px;
      position: absolute;
      left: 5.5px;
      top: 12px;
    }
  }

  .roy-component-adjuster__lock {
    position: absolute;
    top: -15px;
    right: 0;
    z-index: 9;
  }

  .roy-component-adjuster__move {
    position: absolute;
    top: 0;
    left: -25px;
    z-index: 9;
    padding: 2px;
    font-size: 10px;
    border-radius: 2px;
    font-weight: 100;
    cursor: move;
    background: var(--roy-color-primary-light-7);
    color: #aaaaaa;

    &:hover {
      color: #212121;
    }

    &:active {
      color: #212121;
      background: var(--roy-color-primary-light-3);
    }
  }

  .roy-component-adjuster__bind {
    position: absolute;
    top: 20px;
    left: -25px;
    z-index: 9;
    cursor: pointer;
    border-radius: 2px;
    padding: 2px;
    font-size: 10px;
    background: #ffffff;
    color: #999;
  }

  [class^='roy-component-adjuster__shape-point--'] {
    position: absolute;
    border: 1px solid var(--roy-color-primary);
    box-shadow: 0 0 2px #bbb;
    background: #fff;
    width: 6px;
    height: 6px;
    border-radius: 0;
    z-index: 9;
  }

  .adjuster-container {
    cursor: initial;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>
