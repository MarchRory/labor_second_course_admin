<template>
    <div>
        <button v-debounce class="cssbuttons-io-button">
            <div id="text">{{ text }}</div>
            <div class="icon">
                <i class="el-icon-check"></i>
            </div>
        </button>
    </div>
</template>

<script>
export default {
    props: {
        text: {
            type: String,
            default: '确定'
        }
     }
}
</script>

<style lang="scss" scoped>
.cssbuttons-io-button {
  margin: 0;
  background: #A370F0;
  color: white;
  font-family: inherit;
  padding: 0.35em;
  padding-left: 1.2em;
  font-size: 13px;
  font-weight: 500;
  border-radius: 0.9em;
  border: none;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  box-shadow: inset 0 0 1.6em -0.6em #714da6;
  overflow: hidden;
  position: relative;
  height: 2.8em;
  padding-right: 3.3em;
  &:hover{
    cursor: pointer;
  }
}

.cssbuttons-io-button .icon {
  background: white;
  margin-left: 1em;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.2em;
  width: 2.2em;
  border-radius: 0.7em;
  box-shadow: 0.1em 0.1em 0.6em 0.2em #7b52b9;
  right: 0.3em;
  transition: all 0.3s;
}

.cssbuttons-io-button:hover .icon {
  width: calc(100% - 0.6em);
}

.cssbuttons-io-button .icon i {
  width: 1.1em;
  transition: transform 0.3s;
  color: #7b52b9;
  font-weight: bold;
}

.cssbuttons-io-button:hover .icon i {
  transform: translateX(0.1em);
}

.cssbuttons-io-button:active .icon {
  transform: scale(0.95);
}

</style>