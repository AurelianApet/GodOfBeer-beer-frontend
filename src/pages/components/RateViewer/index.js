import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

const starClass = {
    full: 'fa fa-star',
    half: 'fa fa-star-half-o',
    empty: 'fa fa-star-o'
}

class RateViewer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sStarArray: []
        };
    }

    componentDidMount() {
        this.handleCreateStars();
    }


    handleCreateStars = () => {
        const { value, max } = this.props;
        let aStars = [];
        let aValue = Number( value );
        let aMax = max / 5;
        for (let i = 0; i < 5; i ++) {
            aValue = aValue - aMax;
            if (aValue >= 0) {
                aStars.push({
                    class: starClass.full
                });
            } else if (aValue >= -(0.75 * aMax) && aValue <= -(0.25 * aMax)) {
                aStars.push({
                    class: starClass.half
                });
            } else {
                aStars.push({
                    class: starClass.empty
                });
            }
        }
        this.setState({
            sStarArray: aStars
        });
    }

    render() {
        const { sStarArray } = this.state;
        const { color, size, value, valueShow } = this.props;
        return (
            <div className = 'rate-star'>
                {
                    _.map ( sStarArray, (star, starIndex) => {
                        return (
                            <i
                                key = {starIndex}
                                className = {star.class}
                                style = {{
                                    color : color,
                                    fontSize: size}}
                            />
                        )
                    })
                }
                {
                    valueShow &&
                    <div className = 'show-value'>
                        <span>{`평점 ${value}`}</span>
                    </div>
                }

            </div>
        );
    }
}

RateViewer.propTypes = {
    value: PropTypes.oneOfType( [PropTypes.number, PropTypes.string] ),
    max: PropTypes.number,
    color: PropTypes.string,
    size: PropTypes.string,
    valueShow: PropTypes.bool
};

RateViewer.defaultProps = {
    value: 0,
    max: 5,
    color: 'rgb(173, 170, 43)',
    size: '20px',
    valueShow: false
};

export default RateViewer