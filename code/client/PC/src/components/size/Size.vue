<template>
  <div v-if="isShow">
    <div
      v-for="(s, i) in size"
      :key="i"
      :style="{ top: s.top - 20 + 'px', left: s.left - 20 + 'px' }"
      class="ruler-text editable"
    >
      <input
        v-if="s.editable"
        ref="sizeInput"
        v-model.number="s.value"
        :tabindex="'i'"
        v-select="s.edit"
        class="text with-border"
        type="number"
        :style="{ width: 7 * (s.value.toString().length) + 10 + 'px' }"
        @keydown="onkeydown($event,s,i)"
        @keyup.enter="enterUp(s)"
      >
      <span v-else class="text with-border">{{ s.value }}</span>
    </div>
  </div>
</template>
<script>
export default {
  directives: {
    focus: {
      inserted: function(el, binding) {
        binding.value && el.focus()
      }
    },
    select: {
      update: function(el, binding) {
        binding.value && el.select()
      }
    }
  },
  computed: {
    size() {
      return this.$store.getters.size
    },
    isShow() {
      return this.size.length > 0
    }
  },
  methods: {
    onkeydown(ev, s, i) {
      if (ev.keyCode === 9) {
        var length = this.$refs['sizeInput'].length
        var nextIndex = i
        if (i === length - 1) {
          nextIndex = 0
        } else {
          nextIndex++
        }
        this.$refs['sizeInput'][nextIndex].focus()
        this.$refs['sizeInput'][nextIndex].select()
        ev.preventDefault()
      } else if (
        ((ev.keyCode >= 48 && ev.keyCode <= 57) ||
          (ev.keyCode >= 96 && ev.keyCode <= 105)) &&
        s.edit === true
      ) {
        this.$store.dispatch('menu/sizeChangeEdit', i)
      }
    },
    enterUp(s) {
      this.$store.dispatch('menu/sizeEnter', s)
    }
  }
}
</script>
<style lang="scss">
.ruler-text {
  input {
    font-family: inherit;
  }
  input:focus {
    outline: none;
    text-shadow: none;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  input[type='number'] {
    -moz-appearance: textfield;
  }
  &.editable {
    pointer-events: auto;
  }
  pointer-events: none;
  position: absolute;
  top: 0;
  .text {
    &.with-border {
      background: #fff;
      border: 1px solid #999;
      color: #666;
    }
    display: inline-block;
    color: #1b1b1c;
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
    padding: 0 4px;
    text-shadow: -1px 0 #fff, 0 1px #fff, 1px 0 #fff, 0 -1px #fff;
  }
}
</style>
