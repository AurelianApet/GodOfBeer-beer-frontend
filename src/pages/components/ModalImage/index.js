import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

class ModalImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sImages: [],
        }
    }

    setImages = () => {
        const {otherImages, pContent} = this.props;
        let {sImages} = this.state;
        sImages = [];
        sImages.push(pContent.src);
        _.map(otherImages, (imageItem, imageIndex) => {
            sImages.push(imageItem);
        })
        this.setState({sImages})
    }

    handleModalVisible = (aSrc) => {
        this.setImages();
        if (aSrc) {
            window.ModalImageOpen(this, aSrc);
        }
    }

    handleModalClose = (aSrc, e) => {
        if (e) {
            e.stopPropagation();
        }
        window.ModalImageClose(e, aSrc);
    }

    handlePush = (aStyle, e) => {
        const {sImages} = this.state;
        e.stopPropagation();
        let images = [];
        if (!aStyle) {
            images.push(sImages[sImages.length - 1]);
            _.map(sImages, (imageItem, imageIndex) => {
                if (imageIndex !== sImages.length - 1) {
                    images.push(imageItem);
                }
            })
        } else {
            _.map(sImages, (imageItem, imageIndex) => {
                if (imageIndex !== 0) {
                    images.push(imageItem);
                }
            })
            images.push(sImages[0]);
        }
        this.setState({sImages: images})
    }

    getId = () => {
        const {pContent, otherImages} = this.props;
        let result = pContent.src;
        if (otherImages.length > 0) {
            _.map(otherImages, (image, index) => {
                result += image;
            })
        }
        return result;
    }

    render() {
        const {pContent, style, otherImages} = this.props;
        const {sImages} = this.state;
        const defaultId = this.getId();
        const mainSrc = pContent.src || '/assets/images/beerTable/no_image.png';
        const src = sImages[0] || '/assets/images/beerTable/no_image.png';
        const alt = pContent.alt || '';
        return (
            <div className="modal-image-container">
                <img id={`srcImage ${defaultId}`} src={mainSrc} alt={alt} style={style}
                     onClick={this.handleModalVisible.bind(this, defaultId)}/>
                {pContent.src &&
                <div id={`modalImage ${defaultId}`} className="modal-image-special"
                     onClick={this.handleModalClose.bind(this, defaultId)}>
                    <img id={`spreadImage ${defaultId}`} className="modal-image-special-content" src={src} alt={alt}
                         onClick={(e) => {
                             e.stopPropagation()
                         }}/>
                    {otherImages.length !== 0 &&
                    <i className="fa fa-chevron-left icon-font-left" onClick={this.handlePush.bind(this, false)}/>}
                    {otherImages.length !== 0 &&
                    <i className="fa fa-chevron-right icon-font-right" onClick={this.handlePush.bind(this, true)}/>}
                </div>
                }
            </div>
        );
    }
}

ModalImage.propTypes = {
    pContent: PropTypes.object,
    style: PropTypes.object,
    otherImages: PropTypes.array,
};

ModalImage.defaultProps = {
    pContent: {
        src: '',
        alt: '',
    },
    style: {},
    otherImages: [],
};

export default ModalImage;
