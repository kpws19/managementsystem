'use strict';
var app = angular.module("app",['ui.router','toaster','ngAnimate','angularSpinner','jcs-autoValidate']);

app.directive("ccSomething",function(){
	return{
		'transclude':true,
		'restrict':'AE',
		'templateUrl':"templates/spinner.html",
		'scope':{
			'isLoading':'=',
			'message':'@'
		}
	}
});

app.directive("ccSpinner",function(){
	return{
		'transclude':true,
		'restrict':'AE',
		'templateUrl':"templates/spinner.html",
		'scope':{
			'isLoading':'=',
			'message':'@'
		}
	}
});

app.service("usersService",function($http,toaster,$rootScope,$state){
	var self = {
		"selectedUser": null,
		"isLoading":false,
		"search":null,
		"ordering":"name",
		"users":[],
		"userImg":"css/img/default.png",
		"usersType":[],
		"error":false,
		"search":null,
		"userRegister":null,
		"GoUsers":function(){
			$state.go("users");
		},	
		"ValidateUser":function(User){
				return $http.get("http://localhost/management/modules/index.php/searchuserbyname",{params:{name:User}})
			
					
		},
		"SaveUser":function(user){
			// Validando los datos
			if(user.pw_password == user.passwordAgain)
			{
				// Validando si no existe el nombre de usuario.
				if(!self.isLoading)
				{
					self.isLoading = true;

					//validando que no existe el nombre de usuario
					self.ValidateUser(user.nb_user).then(
					 	function(response){
					 		
					 		var Data = response.data;
					 		if(Data.error != 1){
					 			var amountUser = Object.keys(Data).length;
					 			if(amountUser==0)
					 			{
					 				//Registrando al usuario.
					 				$http({method: "post",url:"http://localhost/management/modules/index.php/RegisterUser",
										data: $.param({"nb_fname":user.nb_fname,"nb_lname":user.nb_lname,"de_email":user.de_email,"nb_user":user.nb_user,"password":user.pw_password,"type":user.id_rol}), 
									  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
									})
									 .then(
									 	function(response){
									 		
									 		var Data = response.data;
									 		if(Data.error != 1){
									 			self.isLoading = false;
									 			toaster.pop('success',"Usuario registrado");	
									 			self.userRegister = [];

									   		}else{
									   			self.error     = true;
									 			self.isLoading = false;
									   			toaster.pop('error',Data.mensaje);	
									   		}
									   		//self.usersType = data;
									 	},
									 	function(data){
									 		//self.error     = true;
									 		self.isLoading = false;
									 		toaster.pop('error',data.statusText);	
									 	}
									 )
					 			}else{
					 				toaster.pop('error',"Ese nombre de usuario ya existe, favor de usar otro.");	
					 			}
					   		}else{
					   			self.error     = true;
					 			self.isLoading = false;
					   			toaster.pop('error',Data.mensaje);	
					   		}
					 	},
					 	function(data){
					 		//self.error     = true;
					 		self.isLoading = false;
					 		toaster.pop('error',data.statusText);	
					 	}
					 )
					
				}	
			}else{
				toaster.pop('error',"Favor de escribir passwords iguales.");	
			}
		},
		"GetUsersType":function(){
			if(!self.isLoading)
			{
				self.isLoading = true;
				$http({method: "get",url:"http://localhost/management/modules/index.php/userstype",data: $.param({}), 
				  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				})
				 .then(
				 	function(response){
				 		
				 		var Data = response.data;
				 		if(Data.error != 1){
				 			self.isLoading = false;
				   			self.usersType = Data.info;
				   			console.log(self.usersType);
				   		}else{
				   			self.error     = true;
				 			self.isLoading = false;
				   			toaster.pop('error',Data.mensaje);	
				   		}
				   		//self.usersType = data;
				 	},
				 	function(data){
				 		self.error     = true;
				 		self.isLoading = false;
				 		toaster.pop('error',data.statusText);	
				 	}
				 )
			}
		},
		"getUsers":function(){
			if(!self.isLoading)
			{
				self.isLoading = true;
				$http({method: "get",url:"http://localhost/management/modules/index.php/users",data: $.param({}), 
				  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				})
				 .then(
				 	function (response){
				 		self.isLoading = false;
				 		self.users = response.data.users;
				 		console.log(self.users);
				 	},
				 	function(data){
				 		self.error = true;
				 		toaster.pop('error',data.statusText);	
				 	}
				 )

			}
		},
	};	

	return self;
});


app.controller("MainController",function($scope,$http,toaster,usersService,$rootScope){
	toaster.pop('success',"Welcome!");	
});

app.controller("usersController",function($scope,toaster,usersService,$state){
	$scope.UsersService = usersService;
	$scope.UsersService.getUsers();
	$scope.loader = true;

	$scope.SelectUser = function(user)
	{
		if(usersService.selectedUser == user)
		{
			usersService.selectedUser = null;
		}else{usersService.selectedUser = user;}
	}

	$scope.RedirectAdd = function()
	{
		$state.go("RegisterUser");
	}

	$scope.RedirectEdit = function(id)
	{
		if(id==null)
		{
			toaster.pop('error',"Favor de seleccionar un usuario");	
		}else{
			$state.go("editUser",{id_user:id});
		}
	}
});

app.controller("ViewController",function($scope,usersService){
	$scope.userImg = usersService.userImg;
});



app.config(function($stateProvider,$urlRouterProvider){
	$stateProvider
	.state('list',{
		url:'/',
		templateUrl:'templates/main.html',
		controller:'MainController'
	})

	.state('users',{
		url:'/users',
		templateUrl:'templates/users.html',
		controller:'usersController'
	})

	.state('beautiful',{
		url:'/beautiful',
		templateUrl:'templates/beautiful.html',
		controller:'beautifulController'
	})

	.state('RegisterUser',{
		url:'/RegisterUser',
		templateUrl:'templates/RegisterUser.html',
		controller:'RegisterUserController'
	})

	.state('editUser',{
		url:'/editUser/:id_user',
		templateUrl:'templates/RegisterUser.html',
		controller:'editUserController'
		
	});

	

	$urlRouterProvider.otherwise('/');
});

app.controller("RegisterUserController",function($scope,usersService,$http,toaster,$state){
	$scope.title        = "Registro de usuarios";
	$scope.UsersService = usersService;
	$scope.UsersService.GetUsersType();
	$scope.screenLoc       = "add";
	$scope.types = $scope.UsersService.usersType;
	$scope.userRegister = $scope.UsersService.userRegister;

	$scope.SaveUser = function(user)
	{
		if(user.pw_password == user.passwordAgain)
			{
				// Validando si no existe el nombre de usuario.
				if(!self.isLoading)
				{
					$scope.UsersService.isLoading = true;

					//validando que no existe el nombre de usuario
					$scope.UsersService.ValidateUser(user.nb_user).then(
					 	function(response){
					 		
					 		var Data = response.data;
					 		if(Data.error != 1){
					 			var amountUser = Object.keys(Data).length;
					 			if(amountUser==0)
					 			{
					 				//Registrando al usuario.
					 				$http({method: "post",url:"http://localhost/management/modules/index.php/RegisterUser",
										data: $.param({"nb_fname":user.nb_fname,"nb_lname":user.nb_lname,"de_email":user.de_email,"nb_user":user.nb_user,"password":user.pw_password,"type":user.id_rol}), 
									  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
									})
									 .then(
									 	function(response){
									 		
									 		var Data = response.data;
									 		if(Data.error != 1){
									 			$scope.UsersService.isLoading = false;
									 			toaster.pop('success',"Usuario registrado");	
									 			$scope.UsersService.userRegister = [];

									   		}else{
									   			$scope.UsersService.error     = true;
									 			$scope.UsersService.isLoading = false;
									   			toaster.pop('error',Data.mensaje);	
									   		}
									   		//self.usersType = data;
									 	},
									 	function(data){
									 		//self.error     = true;
									 		$scope.UsersService.isLoading = false;
									 		toaster.pop('error',data.statusText);	
									 	}
									 )
					 			}else{
					 				toaster.pop('error',"Ese nombre de usuario ya existe, favor de usar otro.");	
					 			}
					   		}else{
					   			$scope.UsersService.error     = true;
					 			$scope.UsersService.isLoading = false;
					   			toaster.pop('error',Data.mensaje);	
					   		}
					 	},
					 	function(data){
					 		//self.error     = true;
					 		$scope.UsersService.isLoading = false;
					 		toaster.pop('error',data.statusText);	
					 	}
					 )
			}
		}
	}
		
});

app.controller("editUserController",function($scope,usersService,$http,toaster,$state,$stateParams){
	$scope.title        = "Edición de usuarios";
	$scope.screenLoc       = "edit";
	$scope.id_user      = $stateParams.id_user;
	$scope.UsersService = usersService;
	$scope.userRegister = [];
	$scope.UsersService.GetUsersType();
	$scope.types = $scope.UsersService.usersType;



	// Buscando por id el usuario
	$scope.UsersService.isLoading = true;
	$http.get("http://localhost/management/modules/index.php/searchUserById",{params:{id_user:$scope.id_user}}).then(
		function (response)
		{
	 		$scope.UsersService.isLoading = false;
	 		$scope.userRegister = response.data.info[0];
	 		$scope.userRegister.pw_password = "";
	 		console.log($scope.userRegister);
	 	},
	 	function(data){
	 		self.error = true;
	 		toaster.pop('error',data.statusText);	
	 	}
	);

});

app.run(
	function(defaultErrorMessageResolver){
		defaultErrorMessageResolver.getErrorMessages().then(function(errorMessages){
			errorMessages['badPattern'] = "Llene correctamente el campo";
		});
	}
);