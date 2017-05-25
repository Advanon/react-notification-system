var createReactClass = require('create-react-class');
var PropTypes = require('prop-types');
var ReactDOM = require('react-dom');
var Helpers = require('./helpers');

/* From Modernizr */
var whichTransitionEvent = function() {
  var el = document.createElement('fakeelement');
  var transition;
  var transitions = {
    transition: 'transitionend',
    OTransition: 'oTransitionEnd',
    MozTransition: 'transitionend',
    WebkitTransition: 'webkitTransitionEnd'
  };

  Object.keys(transitions).forEach(function(transitionKey) {
    if (el.style[transitionKey] !== undefined) {
      transition = transitions[transitionKey];
    }
  });

  return transition;
};

var CustomNotificationItem = createReactClass({
  displayName: 'CustomNotificationItem',

  propTypes: {
    uid: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    createNotification: PropTypes.func.isRequired,
    onRemove: PropTypes.func,
    dismissable: PropTypes.bool,
    autoDismiss: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.number
    ])
  },

  getDefaultProps: function() {
    return {
      onRemove: function() {},
      dismissable: true,
      autoDismiss: false
    };
  },

  getInitialState: function() {
    return {
      visible: true,
      removed: false
    };
  },

  _notificationTimer: null,

  _height: 0,

  _noAnimation: null,

  _removeCount: 0,

  _hideNotification: function() {
    if (this._notificationTimer) {
      this._notificationTimer.clear();
    }

    this.setState({
      visible: false,
      removed: true
    });

    if (this._noAnimation) {
      this._removeNotification();
    }
  },

  _removeNotification: function() {
    this.props.onRemove(this.props.uid);
  },

  _dismiss: function() {
    if (!this.props.dismissible) {
      return;
    }

    this._hideNotification();
  },

  _onTransitionEnd: function() {
    if (this._removeCount > 0) return;
    if (this.state.removed) {
      this._removeCount++;
      this._removeNotification();
    }
  },

  componentDidMount: function() {
    var self = this;
    var transitionEvent = whichTransitionEvent();
    var autoDismiss = this.props.autoDismiss;
    var element = ReactDOM.findDOMNode(this);

    if (!element) {
      return;
    }

    this._height = element.offsetHeight;

    // Watch for transition end
    if (!this._noAnimation) {
      if (transitionEvent) {
        element.addEventListener(transitionEvent, this._onTransitionEnd);
      } else {
        this._noAnimation = true;
      }
    }

    if (autoDismiss) {
      this._notificationTimer = new Helpers.Timer(function() {
        self._hideNotification();
      }, autoDismiss * 1000);
    }
  },

  _handleMouseEnter: function() {
    var autoDismiss = this.props.autoDismiss;
    if (autoDismiss) {
      this._notificationTimer.pause();
    }
  },

  _handleMouseLeave: function() {
    var autoDismiss = this.props.autoDismiss;
    if (autoDismiss) {
      this._notificationTimer.resume();
    }
  },

  componentWillUnmount: function() {
    var element = ReactDOM.findDOMNode(this);
    var transitionEvent = whichTransitionEvent();
    element.removeEventListener(transitionEvent, this._onTransitionEnd);
  },

  render: function() {
    var createNotification = this.props.createNotification;
    var className = 'notification notification-success';

    if (this.state.visible) {
      className += ' notification-visible';
    } else if (this.state.visible === false) {
      className += ' notification-hidden';
    }

    return createNotification({
      className: className,
      onHide: this._dismiss,
      onMouseEnter: this._handleMouseEnter,
      onMouseLeave: this._handleMouseLeave,
      style: {
        transition: '0.3s ease-in-out',
        transform: 'translate3d(0px, 0px, 0px)',
        willChange: 'transform, opacity',
        opacity: this.state.visible ? 1 : 0
      }
    });
  }
});

module.exports = CustomNotificationItem;
