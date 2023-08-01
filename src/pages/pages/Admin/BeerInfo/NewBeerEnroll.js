import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes            from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import MaskedInput from 'react-text-mask';

import APIForm, {
	TYPE_INPUT, TYPE_APISELECT,
	TYPE_MASK_INPUT, MODE_CREATE, MODE_READ,
	TITLE_NORMAL,
	ERROR_BORDER,
} from '../../../components/APIForm';
import _ from 'lodash';
import { Modal, ModalHeader, ModalBody} from '../../../components/Modal';
import FileUploadPublic from '../../../components/FileUploadPublic';
import { pushNotification, NOTIFICATION_TYPE_SUCCESS } from '../../../../library/utils/notification';
import { numberUnmask, maskNumber } from '../../../../library/utils/masks';

const UNIT_PRICE_TYPE_DRAFT = 1;
const UNIT_PRICE_TYPE_BOTTLE = 2;
const UNIT_PRICE_TYPE_CAN = 2;

class NewBeerEnroll extends Component {
	constructor(props) {
		super(props)
		this.state = {
			sIsVisible: true,
			sUserId: null,
			sFormMode: MODE_READ,
			sUnitPrice: [],
			sNewUnitPriceType: null,
			sUserImage: '',
			sUserImageFromFileUpload: '',
		};
		this.newUnitPrice = {};
		this.beerContent = '';
		this.apiformDataFetched = false;
	}

	componentDidMount() {
		const userId = _.get( this.props, 'user._id' ) || '';
		this.setState({
			sUserId: userId,
		})
	}

	/**
	 * handle functinos
	 **/

	closeUpdateModal = (aState, e) => {
		if ( e ) {
			e.preventDefault();
		}
		this.setState({
			sIsVisible: false
		});
		this.props.handleModalClose( false, aState );
	};

	handleSubmitBtn = () => {
		this.apiForm.handleSubmitForm();
	};

	handleChangeNewUnitPrice = ( e ) => {
		if ( !e ) return;
		const name = e.target.name;
		const value = e.target.value;
		_.set( this.newUnitPrice, name, value );
		if ( name === 'bottleType' ) {
			this.setState({
				sNewUnitPriceType: value === 'Draft'? UNIT_PRICE_TYPE_DRAFT : value === 'bottle' ? UNIT_PRICE_TYPE_BOTTLE : UNIT_PRICE_TYPE_CAN,
			});
		}
	};

	handleAddNewUnitPrice = () => {
		if ( this.newUnitPrice.bottleType && this.newUnitPrice.capacity && this.newUnitPrice.price ) {
			const { sUnitPrice } = this.state;
			this.newUnitPrice.price = numberUnmask( this.newUnitPrice.price );
			this.newUnitPrice.capacity = numberUnmask( this.newUnitPrice.capacity );
			sUnitPrice.push({
				...this.newUnitPrice,
				capacityUnit: 'ml',
				priceUnit: '원',
			});
			this.setState({
				sUnitPrice,
				sNewUnitPriceType: null,
			}, () => {
				this.newUnitPrice = {};
			});
		}
	};

	handleRemoveUnitPrice = ( aIndex ) => {
		let { sUnitPrice } = this.state;
		sUnitPrice.splice( aIndex, 1 );
		this.setState({
			sUnitPrice,
		});
	};

	handleChangeBeerContent = ( e ) => {
		this.beerContent = e.target.value;
	};

	handleGetPhoto = ( aFiles ) => {
		const url = _.get( aFiles, '[0].url' ) || '';
		this.setState({
			sUserImageFromFileUpload: url,
			sUserImage: url,
		})
	};

	renderUserImage = ( funcHandleClick ) => {
		const { sUserImage, sUserImageFromFileUpload } = this.state;
		if (sUserImage || sUserImageFromFileUpload) {
			return (
				<img
					src={sUserImage || sUserImageFromFileUpload || '/assets/images/producer/user-profile-not-found.jpeg'}
					onError={(e) => {e.target.src = '/assets/images/producer/user-profile-not-found.jpeg'}}
					onClick={funcHandleClick}
					alt=''
				/>
			);
		} else {
			return (
				<div className={'no-image-upload'} onClick={funcHandleClick}>
				</div>
			);
		}

	};

	renderUnitPrices = () => {
		const { sUnitPrice } = this.state;
		let resultHtml = [];
		_.map( sUnitPrice, ( priceItem, priceIndex ) => {
			resultHtml.push(
				<tr key={priceIndex}>
					<td>{priceItem.bottleType}</td>
					<td>{`${maskNumber( priceItem.capacity || '' )}`}</td>
					<td>{`${maskNumber( priceItem.price || '' )}`}</td>
					<td><i className='fa fa-trash-o' onClick={this.handleRemoveUnitPrice.bind( this, priceIndex )} /></td>
				</tr>
			);
		});
		return resultHtml;
	};

	renderNewUnitPrice = () => {
		const { sUnitPrice } = this.state;
		const capacityMask = createNumberMask({
			prefix: '',
			suffix: '',
			thousandsSeparatorSymbol: ',',
		});
		const priceMask = createNumberMask({
			prefix: '',
			suffix: '',
			thousandsSeparatorSymbol: ',',
		});
		return (
			<tr key={`addNewUnitPrice-${sUnitPrice.length}`}>
				<td>
					<select
						ref={(node => {this.newUnitPriceSelect = node})}
						name='bottleType'
						onChange={this.handleChangeNewUnitPrice}
					>
						<option value=''></option>
						<option value='Draft'>Draft</option>
						<option value={'Bottle'}>{'Bottle'}</option>
						<option value={'Can'}>{'Can'}</option>
					</select>
				</td>
				<td>
					<MaskedInput
						ref={(node => {this.newUnitPriceCapacityInput = node})}
						name='capacity' mask={capacityMask}
						onChange={this.handleChangeNewUnitPrice}/>
				</td>
				<td>
					<MaskedInput
						ref={(node => {this.newUnitPricePriceInput = node})}
						name='price' mask={priceMask}
						onChange={this.handleChangeNewUnitPrice}/>
				</td>
				<td><div className='save-new-unit-price' onClick={this.handleAddNewUnitPrice}><i className='fa fa-save'/></div></td>
			</tr>
		);
	};

	renderBeerUnitPriceInput = () => {
		return (
			<div className='beer-unit-price-input-container'>
				<table>
					<thead>
						<tr>
							<th>구분</th>
							<th>용량</th>
							<th>공급가</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{this.renderUnitPrices()}
						{this.renderNewUnitPrice()}
					</tbody>
				</table>
			</div>
		)
	};

	render() {
		const { pMode, pId, user } = this.props;
		const { sIsVisible, sUserId, sUnitPrice, sUserImage, sUserImageFromFileUpload } = this.state;
		const decimalMask = createNumberMask({
			prefix: '',
			allowDecimal: true,
			decimalLimit: 1,
			includeThousandsSeparator: false,
		});

		const beerRegisterColumns = [
			[
				{
					name: 'breweryId',
					type: TYPE_APISELECT,
					url: `/brewery/fetchall`,
					data: ( res ) => {
						let result = [];
						const resDoc = res.brewery || [];
						_.map( resDoc, ( docItem, docIndex ) => {
							result.push({
								value: docItem._id,
								title: docItem.name,
							});
						});
						return result;
					},
					title: {
						type: TITLE_NORMAL,
						string: '브루어리명',
					},
					valid: {
						required: {
							isRequired: true,
							errMsg: '양조장 이름을 확인해주세요'
						},
					},
				},
			],
			[{
				name: 'name',
				type: TYPE_INPUT,
				title: {
					type: TITLE_NORMAL,
					string: '맥주명',
				},
				valid: {
					required: {
						isRequired: true,
						errMsg: '맥주이름을 확인해주세요'
					},
				},
			}],
			[{
				name: 'styleCategory',
				type: TYPE_APISELECT,
				url: `/beer/styles`,
				data: ( res ) => {
					let result = [];
					const resDoc = res.styles || [];
					_.map( resDoc, ( docItem, docIndex ) => {
						result.push({
							value: docItem._id,
							title: docItem.name,
						});
					});
					return result;
				},
				title: {
					type: TITLE_NORMAL,
					string: '스타일분류',
				},
				valid: {
					required: {
						isRequired: true,
						errMsg: '스타일분류를 확인해주세요'
					},
				},
			}],
			[{
				name: 'styles',
				title: {
					type: TITLE_NORMAL,
					string: '맥주 스타일',
				},
				type: TYPE_INPUT,
				valid: {
					required: {
						isRequired: true,
						errMsg: '맥주 스타일을 확인해주세요'
					},
				},
			}],
			[{
				name: 'country',
				title: {
					type: TITLE_NORMAL,
					string: '제조국',
				},
				type: TYPE_INPUT,
				valid: {
					required: {
						isRequired: true,
						errMsg: '제조국을 확인해주세요'
					},
				},
			}],
			[{
				name: 'alcohol',
				type: TYPE_MASK_INPUT,
				title: {
					type: TITLE_NORMAL,
					string: 'A B V',
				},
				mask: decimalMask,
				valid: {
					required: {
						isRequired: true,
						errMsg: '값을 입력해주세요'
					},
				},
			}],
			[{
				name: 'ibu',
				type: TYPE_MASK_INPUT,
				title: {
					type: TITLE_NORMAL,
					string: 'I B U',
				},
				mask: decimalMask,
				valid: {
					required: {
							isRequired: true,
							errMsg: '값을 입력해주세요'
					},
				},
			}],
		];

		return (
			<div>
				<Modal
					toggle={this.closeUpdateModal}
					isOpen={sIsVisible}
					className='new-beer-modal'
				>
					<ModalHeader className='modal-header' toggle={this.closeUpdateModal}>
						<div className = 'modal-title'>{pMode === MODE_CREATE? '맥주 추가' : '맥주 등록 상세' }</div>
					</ModalHeader>
					<ModalBody className='modal-body'>
						<div className='update-form'>
							<FileUploadPublic
								title='대표이미지등록'
								pMaxFileCount={1}
								pIsCustomCallback={true}
								pFileFilter={/^(image\/bmp|image\/gif|image\/jpg|image\/jpeg|image\/png)$/i}
								pButtonCustomRender={this.renderUserImage}
								pHandleUploadDone={this.handleGetPhoto}
							/>
							<APIForm
								onRef={(ref) => {this.apiForm = ref}}
								pMode={{
									mode: pMode,
								}}
								pFormInfo={beerRegisterColumns}
								pAPIInfo={{
									select: {
										queries: [{
											method: 'get',
											url: `/beer/fetchone?id=${pId}`,
										}
										],
										callback: ( res, funcSetValues ) => {
											const result = _.get( res, '[0].beer[0]' ) || {};
											if ( !this.apiformDataFetched ) {
												const unitPrice = result.unitcost || [];
												this.beerContent = result.content || '';
												this.setState({
													sUnitPrice: unitPrice,
													sUserImage: result.image || '',
												});
												this.apiformDataFetched = true;
											}
											funcSetValues( result );
										},
									},
									create: {
										queries: [{
											method: 'post',
											url: '/beer/create',
											data: ( formData ) => {
												formData.uid = sUserId || '';
												formData.unitcost = sUnitPrice;
												formData.content = this.beerContent;
												formData.image = sUserImageFromFileUpload || sUserImage;
												formData.role = user.role;
												return formData;
											}
										}],
										callback: ( res, func ) => {
											pushNotification(NOTIFICATION_TYPE_SUCCESS, '맥주 저장에 성공했습니다');
											this.closeUpdateModal( true );
										},
									},
									update: {
										queries: [{
											method: 'put',
											url: `/beer/updateone/${pId}`,
											data: ( formData ) => {
												formData.role = user.role;
												formData.unitcost = sUnitPrice;
												formData.content = this.beerContent;
												formData.image = sUserImageFromFileUpload || sUserImage;
												console.log(formData);
												return formData;
											}
										}],
										callback: ( res ) => {
											pushNotification(NOTIFICATION_TYPE_SUCCESS, '맥주 저장에 성공했습니다');
											this.closeUpdateModal( true );
										}
									},
								}}
								pThemeInfo={{
									error: {
										errorStyle: ERROR_BORDER,
										showAll: true,
										errColor: '#ff6400',
									}
								}}
							/>
						</div>

						<div className='beer-extra-info'>
							<div className='beer-unit-price-input'>
								<div className='beer-unit-price-input-header'>단가입력</div>
								{this.renderBeerUnitPriceInput()}
							</div>
							<div className='beer-unit-price-content'>
								<div className='beer-unit-price-content-header'>맥주설명</div>
								<textarea
									defaultValue={this.beerContent}
									onChange={this.handleChangeBeerContent}
								/>
							</div>
						</div>
						<div className = 'new-beer-button-group' >
							<button className = 'simple-button' onClick = {this.handleSubmitBtn}>저장</button>
							<button className = 'simple-button' onClick = {this.closeUpdateModal}>취소</button>
						</div>
					</ModalBody>
				</Modal>
			</div>
		);
	}
}

NewBeerEnroll.propTypes = {
	handleModalClose: PropTypes.func,
  pMode: PropTypes.number,

};

NewBeerEnroll.defaultProps = {
	handleModalClose: () => {},
	pMode: MODE_READ,
};

export default compose(
	withRouter,
	connect(
		state => ({
			user: state.auth.user,
		}),
	)
)(NewBeerEnroll);
