import adminService from './admin.service.js';
export class AdminController {
    async getStats(req, res, next) {
        try {
            const stats = await adminService.getSystemStats();
            res.status(200).json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUsers(req, res, next) {
        try {
            const users = await adminService.getAllUsers();
            res.status(200).json({
                success: true,
                data: users
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateUser(req, res, next) {
        try {
            const id = req.params.id;
            const { role, isVerified } = req.body;
            const user = await adminService.updateUser(id, { role, isVerified });
            res.status(200).json({
                success: true,
                data: user,
                message: 'User updated successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new AdminController();
//# sourceMappingURL=admin.controller.js.map