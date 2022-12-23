jQuery.fn.serializeObject = function() {
	var o = {};
	var a = this.serializeArray();
	jQuery.each(a, function() {
		if (o[this.name]) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
};

class Wpinitiator {
	constructor() {
		//initialize here
		this.xhrObj = false;
		this.mutationObserver = false;
		this.notifySetting = {
			allow_dismiss: true,
			newest_on_top: false,
			mouse_over: null,
			delay: 3000,
			timer: 1000,
			offset:{
				x: 20,
				y:180
			},
			placement: {
				from: "top",
				align: "right"
			},
			animate: {
				enter: 'animated fadeInDown',
				exit: 'animated fadeOutUp'
			}
		}

	}

	create() {
		var self = this;

		jQuery(document).on("click","#register-login-btn",function(){
		  jQuery("#login").addClass( "active" );
			jQuery("#register").removeClass( "active" );
		});

		jQuery(document).on("click","#login-register-btn",function(){
			jQuery("#login").removeClass( "active" );
			jQuery("#register").addClass( "active" );
		});

		jQuery(document).on('click', 'a:not(.skip-prevent)', function(event) {

			if (jQuery(this).hasClass('woocommerce-loop-product__link') || jQuery(this).hasClass('wc-block-grid__product-link')) {
				event.preventDefault();
				self.actionOnProductClick(this);
				return false; //skip product page load
			}

			var url = jQuery(this).attr('href');

			if(typeof url!="undefined" && url.indexOf('/checkout')>0){
				//if checkout page then skip ajax page load
				return;
			}

			if (typeof url!="undefined" && url.indexOf('/') >= 0) {
				event.preventDefault();
				self.loadAnchorData(this);
			}
		});

		jQuery(document).on('submit', 'form:not(.skip-prevent):not(.cart)', function(event) {
			var url = jQuery(this).attr('action');
			if (typeof url != 'undefined' && url != '' && url.indexOf('/') >= 0) {
				event.preventDefault();
				self.submitFormAndReloadSection(this, url);
			}
		});


		jQuery(document).on('click', 'button[name="add-to-cart"]', function(event) {
			event.preventDefault();
			event.stopPropagation();
			self.ajaxCartProduct(this);
		});

		jQuery(document.body).on('added_to_cart', function(event,fragments,cart_hash,target){
			if(typeof fragments!='undefined'){
				var targetEle = jQuery(target);

				jQuery.notifyDefaults(self.notifySetting);

				if(targetEle.closest('li').length>0){
					var title = targetEle.closest('li').find('.woocommerce-loop-product__title').text(),
					price = targetEle.closest('li').find('.woocommerce-Price-amount.amount').text();
					jQuery.notify({
						title: '<strong>'+title+'</strong>',
						message: price
					});
				} else if(targetEle.closest('div.summary-content').length>0) {

					var pdpContainer = targetEle.closest('div.summary-content'),
					title = jQuery('#woosq-popup h1.product_title').text(),
					//price = pdpContainer.find('.price .woocommerce-Price-amount.amount').text();
					price = jQuery('#woosq-popup .price .woocommerce-Price-amount.amount').text();
					
					if(pdpContainer.find('.wooco_total').length>0){
						price = pdpContainer.find('.wooco_total .woocommerce-Price-amount.amount').text();
					}
					if(price == ""){
						price = jQuery('#woosq-popup .price .woocommerce-Price-amount.amount').text();
					}

					jQuery.notify({
						title: '<strong>'+title+'</strong>',
						message: price
					});
					

				}

				if(typeof fragments['in_cart_qty']!='undefined'){
					var data, element, parent;
					for(var i in fragments['in_cart_qty']){
						data = fragments['in_cart_qty'][i];
						element = jQuery('a.add_to_cart_button[data-product_id="'+data.pid+'"]');
						if(element.length>0){
							parent = element.closest('li.product');
							parent.find('input.quantity[data-product-id="'+data.pid+'"]').val(data.qty);
							parent.find('div.shopAddToCart').removeClass('qtyHide').addClass('qtyShow');
						}
					}
				}

			}
		});

		window.onpopstate = function(e) {
			if (e.state) {
				document.getElementById("content").innerHTML = e.state.html;
				document.title = e.state.pageTitle;
			}
		}

		jQuery(document).on('change', '.wooco_component_product_checkbox input', function(){

			if(jQuery(this)[0].type==='radio'){
				if(jQuery(this).attr('checked')){
					jQuery(this).closest('.product-multi-selection').find('.product-multi-selection').removeClass('added') ;
					jQuery(this).closest('.product-multi-selection').find(' .wooco_component_product_checkbox_qty_input').val(1);
					jQuery(this).closest('.product-multi-selection').addClass('added');
				}
			} else {
				if(jQuery(this).is(":checked")) {
					jQuery(this).closest('.product-multi-selection').addClass('added');
				} else {
					jQuery(this).closest('.product-multi-selection').removeClass('added');
					jQuery(this).closest('.product-multi-selection').find('.wooco_component_product_checkbox_qty_input').val(1);
					
		       
		    	}
			}
			
			

			self.initializeCompositeCompoment(this);

		});
		/*jQuery(document).on('change', '.wooco_component_product_radio input', function(){

			if(jQuery(this).is(":checked")) {
					jQuery(this).closest('.product-multi-selection').addClass('added');
				} else {
					jQuery(this).closest('.product-multi-selection').removeClass('added');
					jQuery(this).closest('.product-multi-selection').find('.wooco_component_product_checkbox_qty_input').val(1);
				}
			
			

			self.initializeCompositeCompoment(this);

		});*/
		/*******Close popup-Archita**********/
		jQuery(document).on( "click", '.mfp-closed',function() {
			jQuery( ".mfp-close" ).trigger( "click" );
		});
		

		/*jQuery(document).on('click', '.wooco_component_product_checkbox', function(){
			var parent = jQuery(this).closest('.product-multi-selection');
			var preAdded = parent.hasClass('added');
			parent.find('input.wooco_component_product_checkbox').trigger('click');
			//after trigger parent will have added class
			if(!preAdded && (parent.hasClass('added'))){
				console.log('sss');
				var nprice = '£ '+parent.find('input.wooco_component_product_checkbox').attr('data-price');
		        var pname = parent.find('input.wooco_component_product_checkbox').attr('data-title');
		        jQuery.notify({
		            title: '<strong>'+pname+'</strong>',
		            message: nprice
		          });
			}
		});*/
		 
		jQuery(document).on('keyup change', '.wooco_component_product_checkbox_qty_input', function () {
		    var $this = jQuery(this);
		    var checkBox = $this.closest('.product-multi-selection').find('.wooco_component_product_checkbox .com-check');
		    var val = parseFloat($this.val());
		    var min = parseFloat($this.attr('min'));
		    var max = parseFloat($this.attr('max'));

		    if ((
		        val < min
		    ) || isNaN(val)) {
		        val = min;
		        $this.val(val);
		    }

		    if (val > max) {
		        val = max;
		        $this.val(val);
		    }

		    if(checkBox.prop('checked'))
		    	self.initializeCompositeCompoment(checkBox);

		});

		self.resetMutationObserver();

		jQuery(document).on("click", ".qib-button", function ($) {
            // Find quantity input field corresponding to increment button clicked.
            var qty = jQuery(this).siblings(".wqpmb_quantity").find(".qty");
            if(qty.length == 0){
            	return false;
            }
            var val = parseFloat(qty.val());
            var max = parseFloat(qty.attr("max"));
            var min = parseFloat(qty.attr("min"));
            var step = parseFloat(qty.attr("step"));

            // Change input field value if result is in min and max range.
            // If the result is above max then change to max and alert user about exceeding max stock.
            // If the field is empty, fill with min for "-" (0 possible) and step for "+".
            if (jQuery(this).is(".plusq")) {
                if (val === max)
                    return false;
                if (isNaN(val)) {
                    qty.val(step);
                    return false;
                }
                if (val + step > max) {
                    qty.val(max);
                } else {
                    qty.val(val + step);
                }
            } else {
                if (val === min)
                    return false;
                if (isNaN(val)) {
                    qty.val(min);
                    return false;
                }
                if (val - step < min) {
                    qty.val(min);
                } else {
                    qty.val(val - step);
                }
            }

            qty.val(Math.round(qty.val() * 100) / 100);
            qty.trigger("change");

        });

		 var timeout;

        jQuery( function( $ ) {
            jQuery(document).on('change', '.woocommerce-cart-form input.qty', function(){

                if ( timeout !== undefined ) {
                    clearTimeout( timeout );
                }
                timeout = setTimeout(function() {
                    window.updateOnlyCart=true;
                    jQuery("[name='update_cart']").prop('disabled', false).trigger('click');

                }, 500 );

            });
        } );
		

	}



	initializeCompositeCompoment(element){
		var self = this,
			selectionIds = jQuery('form.cart input[name="wooco_ids"]');
		if(selectionIds.length>0){
			var $this = jQuery(element),
				wrap = $this.closest('.wooco-wrap'),
				wrap_id = wrap.attr('data-id'),
		    	container = wooco_container(wrap_id),
		    	container = wrap.closest(container);
		    self.wooco_checkbox_save_ids(jQuery(container), $this);
		    self.wooco_checkbox_calc_price(jQuery(container));
		    self.wooco_checkbox_check_ready(jQuery(container));
		}
	}



	wooco_checkbox_save_ids($wrap, $element) {
	    var $components = $wrap.find('.wooco-components');
	    var $ids = $wrap.find('.wooco-ids');
	    var ids = Array();
	    	
	    $components.find('.wooco_component_product_checkbox .com-check:checked').each(function () {
	        var $this = jQuery(this),
	        	qtyEle = $this.closest('.product-multi-selection').find('input.wooco_component_product_checkbox_qty_input'),
	        	qty = (typeof qtyEle!='undefined' && qtyEle.length>0)? qtyEle.val(): 1;
	        var	newPrice = $this.attr('data-new-price');
	        	newPrice = typeof newPrice!='undefined'? newPrice: '';
	            ids.push($this.val() + '/' + qty + '/' + newPrice);
	            
	    });

	    $ids.val(ids.join(','));
	}


	wooco_checkbox_calc_price ($wrap) {
	    var $components = $wrap.find('.wooco-components');
	    var $total = $wrap.find('.wooco-total');
	    var $artotal = $wrap.find('.btn-arc-total');
	    var total = 0;

	    if ((
	        $components.attr('data-pricing') === 'only'
	    ) && (
	        $components.attr('data-price') !== ''
	    )) {
	        total = Number($components.attr('data-price'));
	    } else {
	        // calc price
	        $components.find('.wooco_component_product_checkbox .com-check:checked').each(function () {
	        	var $this = jQuery(this),
	            qtyEle = $this.closest('.product-multi-selection').find('input.wooco_component_product_checkbox_qty_input'),
	        	qty = (typeof qtyEle!='undefined' && qtyEle.length>0)? qtyEle.val(): 1;
	            total += Number($this.attr('data-price')) * Number(qty);
	        });
       		  var nprice = jQuery('#woosq-popup').find('.btn_wrap .btn-arc-total').attr('data-price');
	        

	        // discount
	        if ((
	            $components.attr('data-percent') > 0
	        ) && (
	            $components.attr('data-percent') < 100
	        )) {
	            total = total * (
	                100 - Number($components.attr('data-percent'))
	            ) / 100;
	        }

	        if ($components.attr('data-pricing') === 'include') {
	            total += Number($components.attr('data-price'));
	            //total += Number(nprice);
	        }
	    }

	    var total_html = '<span class="woocommerce-Price-amount amount">';
	    var total_formatted = wooco_format_money(total, wooco_vars.price_decimals, '', wooco_vars.price_thousand_separator, wooco_vars.price_decimal_separator);

	    switch (wooco_vars.price_format) {
	        case '%1$s%2$s':
	            //left
	            total_html += '<span class="woocommerce-Price-currencySymbol">' + wooco_vars.currency_symbol + '</span>' + total_formatted;
	            break;
	        case '%1$s %2$s':
	            //left with space
	            total_html += '<span class="woocommerce-Price-currencySymbol">' + wooco_vars.currency_symbol + '</span> ' + total_formatted;
	            break;
	        case '%2$s%1$s':
	            //right
	            total_html += total_formatted + '<span class="woocommerce-Price-currencySymbol">' + wooco_vars.currency_symbol + '</span>';
	            break;
	        case '%2$s %1$s':
	            //right with space
	            total_html += total_formatted + ' <span class="woocommerce-Price-currencySymbol">' + wooco_vars.currency_symbol + '</span>';
	            break;
	        default:
	            //default
	            total_html += '<span class="woocommerce-Price-currencySymbol">' + wooco_vars.currency_symbol + '</span> ' + total_formatted;
	    }

	    total_html += '</span>';

	    if ((
	        $components.attr('data-pricing') !== 'only'
	    ) && (
	        parseFloat($components.attr('data-percent')) > 0
	    ) && (
	        parseFloat($components.attr('data-percent')) < 100
	    )) {
	        total_html += ' <small class="woocommerce-price-suffix">' + wooco_vars.saved_text.replace('[d]', wooco_round(parseFloat($components.attr('data-percent'))) + '%') + '</small>';
	    }

	    $total.html(wooco_vars.total_text + ' ' + total_html).slideDown();
	    $artotal.html('Add for '+wooco_vars.total_text + ' ' + total_html).slideDown();
	    $artotal.attr("data-price",total_formatted);

	    if (wooco_vars.change_price !== 'no') {
	        // change the main price
	        var price_selector = '.summary > .price';

	        if ((wooco_vars.price_selector !== null) &&
	            (wooco_vars.price_selector !== '')) {
	            price_selector = wooco_vars.price_selector;
	        }

	        $wrap.find(price_selector).html(total_html);
	    }

	    jQuery(document).trigger('wooco_calc_price', [total, total_formatted, total_html]);
	}

	wooco_checkbox_check_ready ($wrap) {
	    var $components = $wrap.find('.wooco-components');
	    var $btn = $wrap.find('.single_add_to_cart_button');
	    var $alert = $wrap.find('.wooco-alert');
	    var is_selection = false;
	    var selection_name = '';
	    var is_min = false;
	    var is_max = false;
	    var is_same = false;
	    var selected_products = new Array();
	    var allow_same = $components.attr('data-same');
	    var qty = 0;
	    var qty_min = parseFloat($components.attr('data-min'));
	    var qty_max = parseFloat($components.attr('data-max'));

	    $components.find('.wooco_component_product_checkbox .com-check:checked').each(function () {
	        var $this = jQuery(this);
	        var componentPro = jQuery(this).closest('.wooco_component_product');
	        var _id = parseInt($this.attr('data-id'));
	        var qtyEle = $this.closest('.product-multi-selection').find('input.wooco_component_product_checkbox_qty_input');
	        var qty = (typeof qtyEle!='undefined' && qtyEle.length>0)? qtyEle.val(): 1;

	        var _qty = parseFloat(qty);
	        var _required = componentPro.attr('data-required');

	        if (_id > 0) {
	            qty += _qty;
	        }

	        if (allow_same === 'no') {
	            if (selected_products.includes(_id)) {
	                is_same = true;
	            } else {
	                if (_id > 0) {
	                    selected_products.push(_id);
	                }
	            }
	        }

	        if ((_id === 0 && _qty > 0) || (_required === 'yes' && _id <= 0)) {
	            is_selection = true;

	            if (selection_name === '') {
	                selection_name = $this.attr('data-name');
	            }
	        }
	    });

	    if (qty < qty_min) {
	        is_min = true;
	    }

	    if (qty > qty_max) {
	        is_max = true;
	    }

	    if (is_selection || is_min || is_max || is_same) {
	        $btn.addClass('wooco-disabled');
	        $alert.addClass('alert-active');

	        if (is_selection) {
	            $alert.addClass('alert-selection').html(wooco_vars.alert_selection.replace('[name]', '<strong>' + selection_name + '</strong>'));
	            return;
	        }

	        if (is_min) {
	            $alert.addClass('alert-min').html(wooco_vars.alert_min.replace('[min]', qty_min));
	            return;
	        }

	        if (is_max) {
	            $alert.addClass('alert-max').html(wooco_vars.alert_max.replace('[max]', qty_max));
	            return;
	        }

	        if (is_same) {
	            $alert.addClass('alert-same').html(wooco_vars.alert_same);
	        }
	    } else {
	        $alert.removeClass('alert-active alert-selection alert-min alert-max').html('');
	        $btn.removeClass('wooco-disabled');
	    }
	}

	resetMutationObserver(){
		var toggleNode = document.querySelectorAll('a.add_to_cart_button');
		var self = this;
		if(self.mutationObserver){
			self.mutationObserver.disconnect();
		}
		self.mutationObserver = new MutationObserver(self.onupdateofAddtoCartClass);
		jQuery.each(toggleNode, function(){
			self.mutationObserver.observe(this, { attributes: true });
		});
	}

	onupdateofAddtoCartClass(mutationsList, observer) {
	    mutationsList.forEach(mutation => {
	        if (mutation.attributeName === 'class') {
	            let parentLi = jQuery(mutation.target).closest('li.product');
	            if(jQuery(mutation.target).hasClass('added')){
	            	parentLi.removeClass('loading');
	            	parentLi.addClass('added');
	            	setTimeout(function(parentLi){
		            	parentLi.removeClass('added');
		            },2000, parentLi);
	            } else if(jQuery(mutation.target).hasClass('loading')){
	            	parentLi.removeClass('added');
	            	parentLi.addClass('loading');
	            }

	        }
	    });
	}

	actionOnProductClick(element) {
		var parentLi = jQuery(element).closest('li'),
			isComposite = parentLi.hasClass('product-type-composite');
			parentLi.find('a.quick_view').click();

		/*if (isComposite) {
			parentLi.find('a.quick_view').click();
		} else {
			parentLi.find('a.quick_view').click();
			//parentLi.find('a.add_to_cart_button.ajax_add_to_cart').click();
		}*/
	}

	submitFormAndReloadSection(element, url) {
		var self = this,
			formData = jQuery(element).serialize(),
			method = jQuery(element).attr('method');
			if(jQuery(element).hasClass('woocommerce-cart-form')){
				if(typeof window.updateOnlyCart != 'undefined' && window.updateOnlyCart == true){
			  		formData = jQuery(element).serializeObject();
			  		formData['update_cart'] = 'Update cart';
				}

			}

		self.loadAndUpdateSections(url, formData, method);
	}

	loadAnchorData(element) {
		var self = this,
			callUrl = jQuery(element).attr('href');
		self.loadAndUpdateSections(callUrl);
	}

	reloadSectionData() {
		jQuery(document).trigger('reloadSections');
	}

	updateQueryStringParameter(uri, key, value) {
		var re = new RegExp("([/?&])" + key + "[/=].*?([/&]|$)", "i");
		var separator = uri.indexOf('?') !== -1 ? "&" : "?";
		if (uri.match(re)) {
			separator = uri[uri.indexOf(key) + key.length];
			return uri.replace(re, '$1' + key + separator + value + '$2');
		} else {
			return uri + separator + key + "=" + value;
		}
	}

	ajaxCartProduct(element) {
		var self = this,
			target = jQuery(element),
			form = target.closest('form'),
			callUrl = form.attr('action'),
			formData = form.serializeObject(),
			protype = target.attr('data-type');
			
			//callUrl = self.updateQueryStringParameter(callUrl,'wc-ajax','add_to_cart');

		//console.log(protype);
		if(protype != 'wgm_gift_card'){
			callUrl = self.updateQueryStringParameter(callUrl,'wc-ajax','add_to_cart');
		
		

		delete formData['woosq-redirect'];

		formData["product_id"] =  target.attr('value');

		self._callAjax(callUrl, formData, {
			beforeSend: function() {
				target.removeClass('added');
				target.addClass('loading');
			},
			complete: function(response) {
				try {
					//this will remove msg
					if (typeof response.responseJSON != 'undefined') {
						var jcontent = response.responseJSON;
						target.removeClass('loading');
						if(typeof jcontent.fragments){
							const object1 = jcontent.fragments;
							for (const [key, value] of Object.entries(object1)) {
								jQuery(key).replaceWith(value);
							}
							target.addClass('added');
							/*form.append('<div id="temp_msg" class="woocommerce"><div class="woocommerce-message" role="alert">This product has been added to your cart.</div></div>');
							setTimeout(function(){
								jQuery('#temp_msg').remove();
							},4000);*/
							
							jQuery( document.body ).trigger( 'added_to_cart', [ jcontent.fragments, jcontent.cart_hash, target ] );
							jQuery.magnificPopup.close();
						}
					}else{
              				jQuery("body").trigger("wc_fragments_refreshed");
							jQuery.magnificPopup.close();


					}
				} catch (e) {
					target.removeClass('loading');
				}
			},
			error: function(response) {
				target.removeClass('loading');
			}
		}, "POST");
	}
	}

	loadAndUpdateSections(callUrl, formdata, method) {
		var self = this;

		//check if menu is open:
		var hasMenuOpen = jQuery('.main-navigation').hasClass('toggled');
		if(hasMenuOpen){
			jQuery('.main-navigation.toggled').find('button.menu-toggle').trigger('click');
		}
		self.updateLoader(1);

		self._callAjax(callUrl, formdata, {
			beforeSend: function() {
				self.loadMessage('Loading...', 'notice');
				self.updateLoader(20);
			},
			complete: function(response) {
				try {
					//this will remove msg
					if (typeof response.responseJSON != 'undefined') {
						var jcontent = response.responseJSON;
					} else if (typeof response.responseText != 'undefined') {
						let doc = new DOMParser().parseFromString(response.responseText, 'text/html'),
							htmlContent,
							breadCrumb,
							noscripts,
							styles,
							scripts,
							linkStyle,
							breadCrumbEle = jQuery('.woocommerce-breadcrumb'),
							toPasteElem = jQuery('#content').length > 0 ? jQuery('#content') : jQuery('#site-content');

						toPasteElem.html('');
						self.updateLoader(80);

						jQuery("html, body").animate({ scrollTop: 0 }, "slow");
						//site-content
						htmlContent = doc.querySelector('#' + toPasteElem.attr('id'));
						toPasteElem.html(htmlContent);
						jQuery('#site-header-cart').replaceWith(doc.getElementById('site-header-cart'));
						//site-content
						noscripts = doc.getElementsByTagName('noscript');
						styles = doc.getElementsByTagName('style');
						scripts = doc.getElementsByTagName('script');
						//linkStyle = doc.querySelectorAll("link[rel='stylesheet']");
						jQuery('body').attr('class', doc.getElementsByTagName('body')[0].className);
						//jQuery("style").remove();
						jQuery('head').append(styles);

						//jQuery("noscript").remove();
						jQuery('head').append(noscripts);

						//jQuery("link[rel='stylesheet']").remove();
						//jQuery('head').append(linkStyle);

						setTimeout(function() {
							jQuery('script').remove();
							jQuery('body').append(scripts);
							jQuery(window).trigger('load');
							self.resetMutationObserver();
						}, 1500);



						breadCrumb = doc.querySelector('.woocommerce-breadcrumb');
						breadCrumbEle.html(breadCrumb);

						jQuery(document).trigger('ready');

						self.pushBrowserState(htmlContent.innerHTML, doc.title, callUrl);
						self.updateLoader(100);
						/*
						setTimeout(function(isCheckout, thwcfe_public_checkout) {
							//document.dispatchEvent(new Event("DOMContentLoaded"));
						}, 3000, isCheckout, thwcfe_public_checkout);*/

					}
				} catch (e) {
					self.updateLoader(100);
					self.loadMessage('', '');
				}
			}
		}, method);
	}
	_callAjax(url, formdata, additional, method) {
		var self = this,
			config,
			requestMethod = method || 'GET',
			onComplete, newconfig;


		onComplete = function(response) {};

		/*if (method && method == 'POST') {
			if (additional && typeof additional.complete == "function") {
				onComplete = function(response) {
					(additional.complete)(response);
					self.reloadSectionData();
				}
				delete additional.complete;
			}
		} else {
			if (additional && typeof additional.complete == "function") {
				onComplete = additional.complete;
				delete additional.complete;
			}
		}*/

		config = {
			type: 'POST',
			data: formdata,
			showLoader: true,
			dataType: 'json',
			beforeSend: function() {
				self.updateLoader(20);
			},
			complete: onComplete,
			error: function(response) {
				self.updateLoader(100);
				self.loadMessage('Error! Something went wrong.', 'error', true);
			}
		};

		newconfig = jQuery.extend({}, config, additional);
		if (self.xhrObj) {
			self.xhrObj.abort();
		}
		self.xhrObj = jQuery.ajax(url, newconfig);
	}

	pushBrowserState(responseContent, pageTitle, urlPath) {
		document.getElementById("content").innerHTML = responseContent;
		document.title = pageTitle;
		window.history.pushState({
			"html": responseContent,
			"pageTitle": pageTitle
		}, "", urlPath);
	}

	updateLoader(percent){
		var self = this, percentVal;
		percentVal = percent || 1;
		NProgress.configure({ parent: 'header', showSpinner: false});
		if(percentVal==1){

			NProgress.start();
		} else if(percentVal==100) {
			NProgress.done();
			//jQuery('.ldBar').data('value', percentVal);
		} else {
			NProgress.set(percentVal/100);
		}
	}

	loadMessage(msg, type, autoDestroy) {
		var self = this,
			messageTemplate = "<div class='call-message " + type + "'><span class='page-loading'></span>" + msg + "</div>";
		jQuery('.call-message').remove();
		if (msg != '')
			jQuery('#content').prepend(messageTemplate);

		if (typeof autoDestroy != '' && autoDestroy == true) {
			setTimeout(function() {
				jQuery('.call-message').remove();
			}, 1000);
		}
	}
}

var wpinitiator = new Wpinitiator();

wpinitiator.create();
