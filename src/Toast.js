import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Swipeable from 'react-native-swipeable';
import {
  Animated,
  TouchableWithoutFeedback,
  View,
  Text
} from 'react-native'
import ToastStyles from './ToastStyles'

const noop = () => 0

class Toast extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    styles: PropTypes.object,
    duration: PropTypes.number,
    height: PropTypes.number,
    onShow: PropTypes.func,
    onHide: PropTypes.func,
    onPress: PropTypes.func
  }

  static defaultProps = {
    styles: ToastStyles.info,
    duration: 3000,
    height: 100,
    onShow: noop,
    onHide: noop,
    onPress: noop
  }

  state = {
    animatedValue: new Animated.Value(0),
    timeoutId: null,
  }

  componentWillMount () {
    this.showToast()
  }

  componentWillUnmount () {
    const { timeoutId } = this.state;
    clearTimeout(timeoutId)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.id !== nextProps.id) {
      this.showToast()
    }
  }

  showToast () {
    const animatedValue = new Animated.Value(0)

    this.setState({ animatedValue })

    Animated
      .timing(animatedValue, { toValue: 1, duration: 350 })
      .start()

    const { duration, onShow } = this.props
    const timeoutId = setTimeout(() => this.hideToast(), duration + 350)

    this.setState({ timeoutId }, onShow)
  }

  hideToast() {
    const { timeoutId, animatedValue } = this.state

    clearTimeout(timeoutId)

    Animated
      .timing(animatedValue, { toValue: 0, duration: 350 })
      .start()

    setTimeout(this.props.onHide, 350)
  }

  hideToastBySwiping () {
    const { timeoutId } = this.state

    clearTimeout(timeoutId)

    setTimeout(this.props.onHide, 350)
  }

  onPress = () => {
    const {onPress} = this.props;

    this.hideToast()

    if(onPress){
      onPress()
    }
  }

  render () {
    const y = this.state.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [this.props.height, 0]
    })

    const { styles, removeOnSwipe, distanceToRemove } = this.props
    let text = this.props.text

    if (Object.prototype.toString.call(text) === '[object String]') {
      text = (
        <View style={styles.container}>
          <Text style={styles.text}>{text}</Text>
        </View>
      )
    }

    const swipeableProps = removeOnSwipe ? {
      rightContent: <View />,
      onRightActionRelease: () => this.hideToastBySwiping(),
      rightActionActivationDistance: distanceToRemove,
      rightActionReleaseAnimationFn: animatedXY => {
        return Animated.timing(animatedXY.x, {
          toValue: -distanceToRemove*2,
          duration: 350
        })
      }
    } : {}

    return (
      <Swipeable {...swipeableProps}>
        <Animated.View style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          left: 0,
          zIndex: 9999,
          transform: [{ translateY: y }]
        }}>
          <TouchableWithoutFeedback onPress={this.onPress}>
            {text}
          </TouchableWithoutFeedback>
        </Animated.View>
      </Swipeable>
    )
  }
}

export default Toast
