class UserDTO {
    constructor(user) {
        this.id = user._id.toString();
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.password = user.password;
        this.role = user.role;
        this.lastConnection = user.lastConnection; 
    }
}

export default UserDTO;