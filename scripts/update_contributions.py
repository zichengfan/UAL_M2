#!/usr/bin/env python3
"""
直接统计并更新用户contribution计数的脚本
基于最新的memories汇总文件更新用户数据
"""

import json
import os
import glob
from datetime import datetime

def get_latest_memories_file(memories_dir):
    """获取最新的memories汇总文件"""
    pattern = os.path.join(memories_dir, "memories-*.json")
    files = glob.glob(pattern)
    if not files:
        print("❌ 未找到memories汇总文件")
        return None
    
    # 按修改时间排序，取最新的
    latest_file = max(files, key=os.path.getmtime)
    print(f"📄 使用最新的memories文件: {os.path.basename(latest_file)}")
    return latest_file

def count_contributions(memories_file):
    """统计每个用户的contributions"""
    print(f"📊 正在统计contributions...")
    
    with open(memories_file, 'r', encoding='utf-8') as f:
        memories_data = json.load(f)
    
    # 统计每个email的contributions
    contribution_counts = {}
    
    for memory_id, memory in memories_data.items():
        # 使用contributorEmail或registeredContributorId
        email = memory.get('contributorEmail') or memory.get('registeredContributorId')
        if email:
            if email not in contribution_counts:
                contribution_counts[email] = []
            contribution_counts[email].append(memory_id)
    
    print(f"✅ 统计完成，找到 {len(contribution_counts)} 个贡献者")
    for email, memory_ids in contribution_counts.items():
        print(f"  📊 {email}: {len(memory_ids)} contributions")
    
    return contribution_counts

def update_user_files(users_dir, contribution_counts):
    """更新用户文件中的contribution信息"""
    print(f"🔄 正在更新用户文件...")
    
    updated_count = 0
    
    for email, memory_ids in contribution_counts.items():
        user_file = os.path.join(users_dir, f"{email}.json")
        
        if os.path.exists(user_file):
            # 读取现有用户数据
            with open(user_file, 'r', encoding='utf-8') as f:
                user_data = json.load(f)
            
            # 更新memoriesContributed字段
            old_count = len(user_data.get('memoriesContributed', []))
            user_data['memoriesContributed'] = memory_ids
            
            # 写回文件
            with open(user_file, 'w', encoding='utf-8') as f:
                json.dump(user_data, f, indent=2, ensure_ascii=False)
            
            print(f"  ✅ 更新 {email}: {old_count} → {len(memory_ids)} contributions")
            updated_count += 1
        else:
            print(f"  ⚠️ 用户文件不存在: {user_file}")
    
    return updated_count

def main():
    """主函数"""
    print("🚀 开始更新用户contribution计数...")
    
    # 确定目录路径
    base_dir = "/data/zicheng/personal_website/UAL_M2-copilot-debug-data-upload-feature"
    memories_dir = os.path.join(base_dir, "data", "memories")
    users_dir = os.path.join(base_dir, "data", "users")
    
    # 检查目录是否存在
    if not os.path.exists(memories_dir):
        print(f"❌ Memories目录不存在: {memories_dir}")
        return
    
    if not os.path.exists(users_dir):
        print(f"❌ Users目录不存在: {users_dir}")
        return
    
    # 获取最新的memories文件
    latest_memories_file = get_latest_memories_file(memories_dir)
    if not latest_memories_file:
        return
    
    # 统计contributions
    contribution_counts = count_contributions(latest_memories_file)
    
    # 更新用户文件
    updated_count = update_user_files(users_dir, contribution_counts)
    
    print(f"🎉 更新完成！共更新了 {updated_count} 个用户文件")
    print(f"📅 更新时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()