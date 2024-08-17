class UserDTO {
    constructor(user) {
        this.id = user._id.toString();
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.password = user.password; // Asegúrate de incluir la contraseña si la necesitas
        this.role = user.role;
    }
}

export default UserDTO;