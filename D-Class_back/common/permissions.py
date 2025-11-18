from rest_framework import permissions


class IsInstructor(permissions.BasePermission):
    """강사만 접근 가능"""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'instructor'
        )


class IsAcademy(permissions.BasePermission):
    """학원만 접근 가능"""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'academy'
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """소유자만 수정/삭제 가능, 읽기는 모두 가능"""
    def has_object_permission(self, request, view, obj):
        # 읽기 권한은 모두에게 허용
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 수정/삭제는 소유자만
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'author'):
            return obj.author == request.user
        elif hasattr(obj, 'instructor'):
            return obj.instructor == request.user
        elif hasattr(obj, 'academy'):
            return obj.academy == request.user
        
        return False

