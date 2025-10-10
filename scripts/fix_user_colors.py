#!/usr/bin/env python3
"""
修复用户颜色分配脚本
重新为所有用户分配唯一的高对比度颜色
"""

import json
import os
import glob
from datetime import datetime

# 高对比度颜色调色板（与JavaScript中相同）
HIGH_CONTRAST_COLORS = [
    "#f43d3d", "#b2e5df", "#c1380a", "#b2e5d8", "#f43daf", "#329966", "#f9a99e", "#658ccc",
    "#ad891e", "#b2b2e5", "#66c10a", "#e5b2df", "#4fc10a", "#e6a8ef", "#32993f", "#d79ef9",
    "#7f9932", "#983df4", "#659932", "#e5b2c1", "#99e532", "#f99ed7", "#8899e5", "#f4d73d",
    "#32c166", "#f93dd7", "#32e599", "#d7733d", "#0a99c1", "#f9d79e", "#e5323f", "#9ef9c1",
    "#7fc133", "#e599b2", "#66e532", "#b299e5", "#99b232", "#cc8865", "#329932", "#f4a83d",
    "#65b2cc", "#e532c1", "#b2e532", "#d79ec1", "#66cc32", "#e5c1b2", "#99cc65", "#f47f3d"
]

def calculate_rgb_distance(color1, color2):
    """计算两个颜色的RGB距离"""
    def hex_to_rgb(hex_color):
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    rgb1 = hex_to_rgb(color1)
    rgb2 = hex_to_rgb(color2)
    
    return ((rgb1[0] - rgb2[0]) ** 2 + (rgb1[1] - rgb2[1]) ** 2 + (rgb1[2] - rgb2[2]) ** 2) ** 0.5

def select_optimal_color(assigned_colors, available_colors):
    """选择与已分配颜色差异最大的颜色"""
    if not assigned_colors:
        return available_colors[0]
    
    best_color = None
    max_min_distance = -1
    
    for candidate in available_colors:
        if candidate in assigned_colors:
            continue
            
        # 计算与所有已分配颜色的最小距离
        min_distance = min(calculate_rgb_distance(candidate, assigned) for assigned in assigned_colors)
        
        if min_distance > max_min_distance:
            max_min_distance = min_distance
            best_color = candidate
    
    return best_color

def fix_user_colors(users_dir):
    """修复用户颜色分配"""
    print("🎨 开始修复用户颜色分配...")
    
    # 获取所有用户文件
    user_files = glob.glob(os.path.join(users_dir, "*.json"))
    user_files = [f for f in user_files if not f.endswith('.backup') and not f.startswith('contributors-')]
    
    if not user_files:
        print("❌ 未找到用户文件")
        return 0, {}
    
    print(f"📊 找到 {len(user_files)} 个用户文件")
    
    # 按注册时间排序用户
    users_data = []
    for user_file in user_files:
        with open(user_file, 'r', encoding='utf-8') as f:
            user_data = json.load(f)
            users_data.append({
                'file': user_file,
                'data': user_data,
                'email': user_data.get('email', ''),
                'registration_date': user_data.get('registrationDate', '')
            })
    
    # 按注册时间排序
    users_data.sort(key=lambda x: x['registration_date'])
    
    # 重新分配颜色
    assigned_colors = []
    updated_count = 0
    color_mapping = {}  # email -> color 映射
    
    for i, user_info in enumerate(users_data):
        user_data = user_info['data']
        user_file = user_info['file']
        email = user_info['email']
        
        # 选择最优颜色
        if i < len(HIGH_CONTRAST_COLORS):
            new_color = select_optimal_color(assigned_colors, HIGH_CONTRAST_COLORS)
        else:
            # 如果用户数量超过颜色数量，循环使用
            new_color = HIGH_CONTRAST_COLORS[i % len(HIGH_CONTRAST_COLORS)]
        
        old_color = user_data.get('color', 'N/A')
        
        # 更新颜色
        user_data['color'] = new_color
        assigned_colors.append(new_color)
        color_mapping[email] = new_color
        
        # 写回文件
        with open(user_file, 'w', encoding='utf-8') as f:
            json.dump(user_data, f, indent=2, ensure_ascii=False)
        
        print(f"  ✅ {email}: {old_color} → {new_color}")
        updated_count += 1
    
    return updated_count, color_mapping

def fix_memories_colors(memories_dir, color_mapping):
    """修复memories文件中的contributorColor字段"""
    print("🔄 修复memories中的颜色分配...")
    
    # 获取最新的memories汇总文件
    pattern = os.path.join(memories_dir, "memories-*.json")
    files = glob.glob(pattern)
    if not files:
        print("❌ 未找到memories汇总文件")
        return 0
    
    latest_file = max(files, key=os.path.getmtime)
    print(f"📄 更新文件: {os.path.basename(latest_file)}")
    
    # 读取memories数据
    with open(latest_file, 'r', encoding='utf-8') as f:
        memories_data = json.load(f)
    
    updated_memories = 0
    
    # 更新每个memory的contributorColor
    for memory_id, memory in memories_data.items():
        contributor_email = memory.get('contributorEmail') or memory.get('registeredContributorId')
        
        if contributor_email and contributor_email in color_mapping:
            old_color = memory.get('contributorColor', 'N/A')
            new_color = color_mapping[contributor_email]
            
            if old_color != new_color:
                memory['contributorColor'] = new_color
                updated_memories += 1
                print(f"  ✅ Memory {memory_id}: {old_color} → {new_color}")
    
    if updated_memories > 0:
        # 保存更新后的memories文件
        with open(latest_file, 'w', encoding='utf-8') as f:
            json.dump(memories_data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 已更新 {updated_memories} 个memories的颜色")
        
        # 同时更新单个memory文件
        update_individual_memory_files(memories_dir, memories_data)
    else:
        print("✅ 所有memories的颜色都已经是最新的")
    
    return updated_memories

def update_individual_memory_files(memories_dir, memories_data):
    """更新单个memory文件"""
    print("🔄 更新单个memory文件...")
    
    updated_files = 0
    for memory_id, memory in memories_data.items():
        memory_file = os.path.join(memories_dir, f"{memory_id}.json")
        
        if os.path.exists(memory_file):
            with open(memory_file, 'w', encoding='utf-8') as f:
                json.dump(memory, f, indent=2, ensure_ascii=False)
            updated_files += 1
    
    print(f"💾 已更新 {updated_files} 个单个memory文件")
    return updated_files

def validate_color_uniqueness(users_dir):
    """验证颜色唯一性"""
    print("🔍 验证颜色分配唯一性...")
    
    user_files = glob.glob(os.path.join(users_dir, "*.json"))
    user_files = [f for f in user_files if not f.endswith('.backup') and not f.startswith('contributors-')]
    
    color_assignments = {}
    duplicates = []
    
    for user_file in user_files:
        with open(user_file, 'r', encoding='utf-8') as f:
            user_data = json.load(f)
            email = user_data.get('email', '')
            color = user_data.get('color', '')
            
            if color in color_assignments:
                duplicates.append({
                    'color': color,
                    'users': [color_assignments[color], email]
                })
            else:
                color_assignments[color] = email
    
    if duplicates:
        print("❌ 发现颜色重复:")
        for dup in duplicates:
            print(f"   颜色 {dup['color']}: {', '.join(dup['users'])}")
        return False
    else:
        print(f"✅ 颜色分配验证通过，{len(color_assignments)} 个用户都有唯一颜色")
        return True

def main():
    """主函数"""
    print("🚀 开始修复用户颜色分配问题...")
    
    base_dir = "/data/zicheng/personal_website/UAL_M2-copilot-debug-data-upload-feature"
    users_dir = os.path.join(base_dir, "data", "users")
    memories_dir = os.path.join(base_dir, "data", "memories")
    
    if not os.path.exists(users_dir):
        print(f"❌ 用户目录不存在: {users_dir}")
        return
    
    if not os.path.exists(memories_dir):
        print(f"❌ Memories目录不存在: {memories_dir}")
        return
    
    # 验证当前状态
    print("📊 检查当前颜色分配状态...")
    is_valid_before = validate_color_uniqueness(users_dir)
    
    if is_valid_before:
        print("✅ 当前颜色分配已经是唯一的，无需修复")
        
        # 即使用户颜色正确，也检查memories颜色是否需要更新
        print("🔍 检查memories中的颜色是否需要更新...")
        
        # 获取当前用户颜色映射
        color_mapping = {}
        user_files = glob.glob(os.path.join(users_dir, "*.json"))
        user_files = [f for f in user_files if not f.endswith('.backup') and not f.startswith('contributors-')]
        
        for user_file in user_files:
            with open(user_file, 'r', encoding='utf-8') as f:
                user_data = json.load(f)
                email = user_data.get('email', '')
                color = user_data.get('color', '')
                if email and color:
                    color_mapping[email] = color
        
        # 修复memories颜色
        memories_updated = fix_memories_colors(memories_dir, color_mapping)
        
        if memories_updated > 0:
            print(f"🎉 修复完成！更新了 {memories_updated} 个memories的颜色")
        else:
            print("✅ 所有数据都已经是最新状态")
            
    else:
        print("🔧 检测到颜色重复问题，开始修复...")
        
        # 修复用户颜色分配
        updated_count, color_mapping = fix_user_colors(users_dir)
        
        # 修复memories颜色
        memories_updated = fix_memories_colors(memories_dir, color_mapping)
        
        # 验证修复结果
        print("\n🔍 验证修复结果...")
        is_valid_after = validate_color_uniqueness(users_dir)
        
        if is_valid_after:
            print(f"🎉 修复成功！")
            print(f"   - 更新了 {updated_count} 个用户的颜色分配")
            print(f"   - 更新了 {memories_updated} 个memories的颜色")
        else:
            print("❌ 修复失败，仍存在颜色重复问题")
    
    print(f"\n📈 颜色系统统计:")
    print(f"   - 可用颜色总数: {len(HIGH_CONTRAST_COLORS)}")
    print(f"   - 颜色分配算法: 智能差异最大化")
    print(f"   - 修复时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   - 数据完整性: 用户文件 + memories文件同步更新")

if __name__ == "__main__":
    main()