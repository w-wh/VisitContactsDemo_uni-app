<template>
	<view class="content">
		<button type="primary" style="margin-top: 200upx;" @click="visitContacts()">访问通讯录</button>
	</view>
</template>

<script>
	import nativeCommon from '@/utils/native.common';
	export default {
		data() {
			return {
			}
		},
		methods: {
			visitContacts() {
				nativeCommon.contacts.getContact(function(name, number){
					uni.showToast({
						title: name + ' ' + number,
						icon: 'none'
					});
				},function(){
					console.log('开始加载');
					uni.showLoading();
				},function(){
					console.log('加载完成');
					uni.hideLoading();
				});
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
